import { Request, Response } from "express";
import { agentFormService } from "../services/agentform.service.js";
import { auth } from "../utils/auth.js";
import { prisma } from "../config/database.js";
import { getUploadedPhotoPath } from "../utils/photoPath.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

interface MulterRequest extends AuthRequest {
    file?: Express.Multer.File & { path: string };
}

const getRouteParamId = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }
    return value ?? "";
};

export const agentFormController = {
    async getAgents(req: Request, res: Response) {
        try {
            const agents = await agentFormService.getAllAgents();
            return res.status(200).json(agents);
        } catch (error) {
            console.error("Error fetching agents:", error);
            return res.status(500).json({ error: "Failed to fetch agents" });
        }
    },

    async getAgentById(req: Request, res: Response) {
        try {
            const id = getRouteParamId(req.params.id);
            const agent = await agentFormService.getAgentById(id);
            if (!agent) {
                return res.status(404).json({ error: "Agent not found" });
            }
            return res.status(200).json(agent);

        } catch (error) {
            console.error("Error fetching agent details:", error);
            return res.status(500).json({ error: "Failed to fetch agent details" });
        }
    },

    async createAgent(req: MulterRequest, res: Response) {
        let createdUserId: string | null = null;

        try {
            // Disk / cloud shob storage e kaj kore
            const photoPath = getUploadedPhotoPath(req.file) ?? null;

            const {
                name,
                fathersName,
                mobileNo,
                whatsAppNumber,
                bkashNumber,
                bankAccountNumber,
                presentAddress,
                permanentAddress,
                emergencyName,
                emergencyRelation,
                emergencyMobile,
                emergencyAddress,
                email,
                password,
            } = req.body;

            const requiredFields: Record<string, any> = {
                name,
                fathersName,
                mobileNo,
                presentAddress,
                permanentAddress,
                emergencyName,
                emergencyRelation,
                emergencyMobile,
                emergencyAddress,
                email,
                password,
            };

            const missingFields = Object.keys(requiredFields).filter(
                (key) => !requiredFields[key] || String(requiredFields[key]).trim() === ""
            );

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: "Missing required fields",
                    missingFields,
                });
            }

            if (String(password).length < 6) {
                return res.status(400).json({ error: "Password minimum 6 characters" });
            }

            // একই mobile আগে থেকে থাকলে ব্লক
            const existingAgent = await agentFormService.findByMobile(String(mobileNo).trim());
            if (existingAgent) {
                return res.status(409).json({ error: "Ei mobile number e already agent ache" });
            }



            // 1) better-auth দিয়ে User + password তৈরি
            const signUpResult = await auth.api.signUpEmail({
                body: {
                    email: String(email).trim().toLowerCase(),
                    password: String(password),
                    name: String(name).trim(),
                },
            });

            createdUserId = signUpResult?.user?.id ?? null;

            if (!createdUserId) {
                return res.status(400).json({
                    error: "User create kora jay nai (email already used hote pare)",
                });
            }

            // 2) Agent + role=agent + userId লিংক
            const newAgent = await agentFormService.createAgentWithUser({
                userId: createdUserId,
                agent: {
                    name: String(name).trim(),
                    fathersName: String(fathersName).trim(),
                    mobileNo: String(mobileNo).trim(),
                    whatsAppNumber: whatsAppNumber || null,
                    bkashNumber: bkashNumber || null,
                    bankAccountNumber: bankAccountNumber || null,
                    presentAddress: String(presentAddress).trim(),
                    permanentAddress: String(permanentAddress).trim(),
                    emergencyName: String(emergencyName).trim(),
                    emergencyRelation: String(emergencyRelation).trim(),
                    emergencyMobile: String(emergencyMobile).trim(),
                    emergencyAddress: String(emergencyAddress).trim(),
                    photo: photoPath || null,
                },
            });

            return res.status(201).json({
                message: "Agent registered successfully. Please login with mobile number & password.",
                newAgent,
            });
        } catch (error: any) {
            console.error("Error creating agent:", error);

            // Rollback: Agent তৈরি ব্যর্থ হলে তৈরি হওয়া User মুছে ফেলা
            if (createdUserId) {
                await prisma.user.delete({ where: { id: createdUserId } }).catch(() => null);
            }

            const msg =
                error?.body?.message ||
                error?.message ||
                "Failed to create agent";
            return res.status(500).json({ error: msg });
        }
    },

    async updateAgent(req: MulterRequest, res: Response) {
        try {
            const id = getRouteParamId(req.params.id);
            const photoPath = getUploadedPhotoPath(req.file) ?? req.body.photo;
            const updateData: Record<string, any> = {};

            if (photoPath) updateData.photo = photoPath;
            if (req.body.name) updateData.name = req.body.name;
            if (req.body.fathersName) updateData.fathersName = req.body.fathersName;
            if (req.body.mobileNo) updateData.mobileNo = req.body.mobileNo;
            if (req.body.whatsAppNumber !== undefined)
                updateData.whatsAppNumber = req.body.whatsAppNumber;
            if (req.body.bkashNumber !== undefined)
                updateData.bkashNumber = req.body.bkashNumber;
            if (req.body.bankAccountNumber !== undefined)
                updateData.bankAccountNumber = req.body.bankAccountNumber;
            if (req.body.presentAddress) updateData.presentAddress = req.body.presentAddress;
            if (req.body.permanentAddress)
                updateData.permanentAddress = req.body.permanentAddress;
            if (req.body.emergencyName) updateData.emergencyName = req.body.emergencyName;
            if (req.body.emergencyRelation)
                updateData.emergencyRelation = req.body.emergencyRelation;
            if (req.body.emergencyMobile)
                updateData.emergencyMobile = req.body.emergencyMobile;
            if (req.body.emergencyAddress)
                updateData.emergencyAddress = req.body.emergencyAddress;

            const updatedAgent = await agentFormService.updateAgent(id, updateData);
            return res
                .status(200)
                .json({ message: "Agent updated successfully", updatedAgent });
        } catch (error: any) {
            console.error("Error updating agent:", error);
            return res.status(500).json({ error: error?.message || "Failed to update agent" });
        }
    },

    async deleteAgent(req: Request, res: Response) {
        try {
            const id = getRouteParamId(req.params.id);
            await agentFormService.deleteAgent(id);
            return res.status(200).json({ message: "Agent deleted successfully" });
        } catch (error) {
            console.error("Error deleting agent:", error);
            return res.status(500).json({ error: "Failed to delete agent" });
        }
    },

    // GET /api/agents/me  (agent nijer profile dekhbe)
    async getMyProfile(req: AuthRequest, res: Response) {
        try {
            if (req.user?.role !== "agent" || !req.agentId) {
                return res.status(403).json({ error: "Shudhu Agent nijer profile dekhte pare" });
            }

            const agent = await prisma.agent.findUnique({ where: { id: req.agentId } });
            if (!agent) {
                return res.status(404).json({ error: "Agent not found" });
            }

            return res.status(200).json(agent);

        } catch (error) {
            console.error("getMyProfile error:", error);
            return res.status(500).json({ error: "Failed to fetch profile" });
        }
    },

    // PATCH /api/agents/me  (agent nijer profile edit korbe, delete korte parbe na)
    async updateMyProfile(req: MulterRequest, res: Response) {
        try {
            if (req.user?.role !== "agent" || !req.agentId) {
                return res.status(403).json({ error: "Shudhu Agent nijer profile edit korte pare" });
            }

            const REQUIRED_FIELDS = [
                "name", "fathersName", "mobileNo", "presentAddress", "permanentAddress",
                "emergencyName", "emergencyRelation", "emergencyMobile", "emergencyAddress",
            ];
            const OPTIONAL_FIELDS = ["whatsAppNumber", "bkashNumber", "bankAccountNumber"];
            const DIGIT_FIELDS = ["mobileNo", "whatsAppNumber", "bkashNumber", "emergencyMobile"];

            const data: Record<string, any> = {};

            // Shudhu allowed field gulo nibe (userId, id, createdAt ... kichui badlano jabe na)
            for (const key of REQUIRED_FIELDS) {
                if (req.body[key] === undefined) continue;
                let value = String(req.body[key]).trim();
                if (DIGIT_FIELDS.includes(key)) value = value.replace(/\D/g, "");
                if (!value) {
                    return res.status(400).json({ error: `${key} khali rakha jabe na` });
                }
                data[key] = value;
            }

            for (const key of OPTIONAL_FIELDS) {
                if (req.body[key] === undefined) continue;
                let value = String(req.body[key]).trim();
                if (DIGIT_FIELDS.includes(key)) value = value.replace(/\D/g, "");
                data[key] = value || null;
            }

            // Mobile number login er id, tai onno agent er number hote parbe na
            if (data.mobileNo) {
                const clash = await prisma.agent.findFirst({
                    where: { mobileNo: data.mobileNo, NOT: { id: req.agentId } },
                    select: { id: true },
                });
                if (clash) {
                    return res.status(409).json({ error: "Ei mobile number onno agent er ache" });
                }
            }

            const photo = getUploadedPhotoPath(req.file);
            if (photo) data.photo = photo;

            if (Object.keys(data).length === 0) {
                return res.status(400).json({ error: "Update korar moto kono data nei" });
            }

            const updatedAgent = await prisma.agent.update({
                where: { id: req.agentId },
                data,
            });

            return res.status(200).json({ message: "Profile updated successfully", updatedAgent });
        } catch (error: any) {
            console.error("updateMyProfile error:", error);
            return res.status(500).json({ error: error?.message || "Failed to update profile" });
        }
    },

    // POST /api/agents/verify  (mobile + password diye login)
    async verifyAgent(req: Request, res: Response) {
        try {
            const { mobileNo, password } = req.body;
            if (!mobileNo || !password) {
                return res.status(400).json({ error: "Mobile number and password required" });
            }

            const agent = await agentFormService.findByMobileWithUser(String(mobileNo).trim());
            if (!agent) {
                return res.status(404).json({ error: "Agent pawa jay nai" });
            }
            if (!agent.user || !agent.user.email) {
                return res.status(403).json({ error: "Agent account link nai" });
            }

            // better-auth diye password check + session toiri
            let signInHeaders: Headers;
            try {
                const result = await auth.api.signInEmail({
                    body: {
                        email: agent.user.email,
                        password: String(password),
                    },
                    returnHeaders: true,
                });
                signInHeaders = result.headers;
            } catch {
                return res.status(401).json({ error: "Password bhul" });
            }

            // Session cookie browser e pathano (eta na korle hajjah list e 401 ashbe)
            const cookies = signInHeaders.getSetCookie();
            if (cookies.length) res.setHeader("Set-Cookie", cookies);

            return res.status(200).json({
                success: true,
                agent: {
                    id: agent.id,
                    name: agent.name,
                    mobileNo: agent.mobileNo,
                    userId: agent.userId,
                },
            });
        } catch (error: any) {
            console.error("verifyAgent error:", error);
            return res.status(500).json({ error: error?.message || "Verification failed" });
        }
    },
};