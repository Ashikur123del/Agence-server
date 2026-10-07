import { hajjahService, HttpError } from "../services/hajjah.sevvice.js";
import { getUploadedPhotoPath } from "../utils/photoPath.js";
const BD_PHONE = /^01[3-9]\d{8}$/;
const STATUSES = ["PENDING", "APPROVED", "REJECTED"];
// =====================================================
// Helpers
// =====================================================
const getRouteParamId = (value) => {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }
    return value ?? "";
};
const getQueryString = (value) => {
    const v = Array.isArray(value) ? value[0] : value;
    return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
};
const handleError = (res, error, fallback) => {
    if (error instanceof HttpError) {
        return res.status(error.status).json({ error: error.message });
    }
    // Unique constraint (NID / Passport)
    if (error?.code === "P2002") {
        const fields = Array.isArray(error.meta?.target)
            ? error.meta.target.join(", ")
            : "value";
        return res.status(409).json({ error: `Already registered: ${fields}` });
    }
    // Record not found
    if (error?.code === "P2025") {
        return res.status(404).json({ error: "Hajjah not found" });
    }
    // Foreign key (invalid agentId)
    if (error?.code === "P2003") {
        return res.status(400).json({ error: "Invalid agentId" });
    }
    console.error(`${fallback}:`, error);
    return res.status(500).json({ error: error?.message || fallback });
};
// Agent shudhu nijer hajjah badlate parbe, approved hole noy. Admin shob pare.
async function assertCanModify(req, id) {
    if (req.user?.role === "admin")
        return;
    const h = await hajjahService.getHajjahById(id);
    if (!h)
        throw new HttpError(404, "Hajjah not found");
    if (h.agentId !== req.agentId)
        throw new HttpError(403, "This hajjah apnar na");
    if (h.status === "APPROVED") {
        throw new HttpError(409, "Approved registration edit kora jabe na");
    }
}
// =====================================================
// Field groups (multipart/form-data te shob kichu string ashe)
// =====================================================
const STRING_FIELDS = [
    "name", "fathersName", "mothersName", "gender", "maritalStatus",
    "nidNo", "mobileNo", "whatsappNo", "district",
    "presentAddress", "permanentAddress",
    "passportNo", "passportIssuePlace",
    "mahramName", "mahramRelation", "mahramMobile", "mahramPassportNo",
    "bloodGroup", "medicalConditions",
    "emergencyContactName", "emergencyContactRelation", "emergencyContactPhone",
    "roomType", "specialAssistance", "notes",
    "packageType", "paymentMethod", "paymentNumber", "transactionId",
    "referredBy", "agentId",
];
const DATE_FIELDS = ["dob", "passportIssueDate", "passportExpiry", "travelDate"];
const BOOL_FIELDS = ["meningitisVaccine", "previousHajj"];
const INT_FIELDS = ["totalAmount", "paidAmount"];
const REQUIRED = new Set([
    "name", "fathersName", "dob", "nidNo", "mobileNo", "presentAddress",
    "passportNo", "passportExpiry",
    "emergencyContactName", "emergencyContactPhone",
]);
// Ei field gulor DB te default value ache, khali pathale skip hobe
const DEFAULTED = new Set([
    "gender", "maritalStatus", "bloodGroup", "emergencyContactRelation",
    "roomType", "packageType", "paymentMethod",
]);
const PHONE_FIELDS = new Set([
    "mobileNo", "whatsappNo", "mahramMobile",
    "emergencyContactPhone", "paymentNumber",
]);
/**
 * create : shob required field lagbe
 * put    : shob required field lagbe, bakira na dile null / reset hoye jabe
 * patch  : shudhu jegulo pathano hoyeche segulo update hobe
 */
const buildHajjahData = (body, mode) => {
    const data = {};
    const missing = [];
    const invalid = [];
    // ---------- Strings ----------
    for (const key of STRING_FIELDS) {
        const raw = body[key];
        if (raw === undefined || raw === null) {
            if (mode === "put" && !REQUIRED.has(key) && !DEFAULTED.has(key)) {
                data[key] = null;
            }
            continue;
        }
        let value = String(raw).trim();
        if (PHONE_FIELDS.has(key))
            value = value.replace(/\D/g, "");
        if (key === "passportNo")
            value = value.toUpperCase();
        if (value === "") {
            if (REQUIRED.has(key))
                missing.push(key);
            else if (!DEFAULTED.has(key))
                data[key] = null;
            continue;
        }
        if (PHONE_FIELDS.has(key) && !BD_PHONE.test(value))
            invalid.push(key);
        data[key] = value;
    }
    // ---------- Dates ----------
    for (const key of DATE_FIELDS) {
        const raw = body[key];
        const provided = raw !== undefined && raw !== null;
        const empty = provided && String(raw).trim() === "";
        if (!provided || empty) {
            if (empty && REQUIRED.has(key))
                missing.push(key);
            else if ((empty || mode === "put") && !REQUIRED.has(key))
                data[key] = null;
            continue;
        }
        const date = new Date(String(raw));
        if (isNaN(date.getTime()))
            invalid.push(key);
        else
            data[key] = date;
    }
    // ---------- Booleans ----------
    for (const key of BOOL_FIELDS) {
        const raw = body[key];
        if (raw === undefined || raw === null) {
            if (mode === "put")
                data[key] = false;
            continue;
        }
        data[key] = raw === true || ["true", "1", "on"].includes(String(raw).toLowerCase());
    }
    // ---------- Integers (Taka) ----------
    for (const key of INT_FIELDS) {
        const raw = body[key];
        if (raw === undefined || raw === null || String(raw).trim() === "") {
            if (mode === "put")
                data[key] = 0;
            continue;
        }
        const num = Number(raw);
        if (!Number.isInteger(num) || num < 0)
            invalid.push(key);
        else
            data[key] = num;
    }
    // ---------- Full mode e required check ----------
    if (mode !== "patch") {
        for (const key of REQUIRED) {
            if (data[key] === undefined && !missing.includes(key))
                missing.push(key);
        }
        // Female hole Mahram lagbe
        const gender = data.gender ?? "Female";
        if (gender === "Female") {
            if (!data.mahramName && !missing.includes("mahramName"))
                missing.push("mahramName");
            if (!data.mahramMobile && !missing.includes("mahramMobile"))
                missing.push("mahramMobile");
        }
    }
    // Paid > Total hote parbe na
    if (typeof data.paidAmount === "number" &&
        typeof data.totalAmount === "number" &&
        data.paidAmount > data.totalAmount) {
        invalid.push("paidAmount");
    }
    return { data, missing, invalid };
};
// =====================================================
// Controller
// =====================================================
export const hajjahController = {
    // GET /api/hajjah?name=&mobileNo=&search=&status=&page=&limit=
    async getHajjahs(req, res) {
        try {
            const statusQuery = getQueryString(req.query.status)?.toUpperCase();
            if (statusQuery && !STATUSES.includes(statusQuery)) {
                return res.status(400).json({ error: "Invalid status filter" });
            }
            const page = Math.max(parseInt(getQueryString(req.query.page) ?? "1", 10) || 1, 1);
            const limit = Math.min(Math.max(parseInt(getQueryString(req.query.limit) ?? "20", 10) || 20, 1), 100);
            const result = await hajjahService.getAllHajjahs({
                name: getQueryString(req.query.name),
                mobileNo: getQueryString(req.query.mobileNo),
                search: getQueryString(req.query.search),
                status: statusQuery,
                page,
                limit,
                // Agent shudhu nijer hajjah dekhbe, admin shob dekhbe
                agentId: req.user?.role === "agent" ? req.agentId ?? undefined : undefined,
            });
            return res.status(200).json(result);
        }
        catch (error) {
            return handleError(res, error, "Failed to fetch hajjahs");
        }
    },
    // GET /api/hajjah/stats
    async getStats(req, res) {
        try {
            const agentId = req.user?.role === "agent" ? req.agentId ?? undefined : undefined;
            const counts = await hajjahService.getStatusCounts(agentId);
            return res.status(200).json(counts);
        }
        catch (error) {
            return handleError(res, error, "Failed to fetch stats");
        }
    },
    // GET /api/hajjah/:id
    async getHajjahById(req, res) {
        try {
            const id = getRouteParamId(req.params.id);
            const hajjah = await hajjahService.getHajjahById(id);
            if (!hajjah) {
                return res.status(404).json({ error: "Hajjah not found" });
            }
            // Agent hole ownership check
            if (req.user?.role === "agent" && hajjah.agentId !== req.agentId) {
                return res.status(403).json({ error: "This hajjah apnar na" });
            }
            return res.status(200).json(hajjah);
        }
        catch (error) {
            return handleError(res, error, "Failed to fetch hajjah details");
        }
    },
    // POST /api/hajjah
    async createHajjah(req, res) {
        try {
            const { data, missing, invalid } = buildHajjahData(req.body, "create");
            if (missing.length > 0) {
                return res.status(400).json({
                    error: "Missing required fields for hajjah registration",
                    missingFields: missing,
                });
            }
            if (invalid.length > 0) {
                return res.status(400).json({
                    error: "Invalid values",
                    invalidFields: invalid,
                });
            }
            // Agent hole session theke agentId boshbe (body er agentId ignore)
            if (req.user?.role === "agent") {
                data.agentId = req.agentId;
            }
            const photo = getUploadedPhotoPath(req.file);
            const newHajjah = await hajjahService.createHajjah({
                ...data,
                photo,
            });
            return res
                .status(201)
                .json({ message: "Hajjah registered successfully", newHajjah });
        }
        catch (error) {
            return handleError(res, error, "Failed to create hajjah");
        }
    },
    // PUT /api/hajjah/:id  (full update)
    async replaceHajjah(req, res) {
        return updateHandler("put", req, res);
    },
    // PATCH /api/hajjah/:id  (partial update)
    async updateHajjah(req, res) {
        return updateHandler("patch", req, res);
    },
    // PATCH /api/hajjah/:id/status  (Admin only)
    async reviewHajjah(req, res) {
        try {
            const id = getRouteParamId(req.params.id);
            const status = String(req.body.status ?? "").toUpperCase();
            const rejectReason = typeof req.body.rejectReason === "string"
                ? req.body.rejectReason.trim()
                : undefined;
            if (!STATUSES.includes(status)) {
                return res.status(400).json({
                    error: "status must be PENDING, APPROVED or REJECTED",
                });
            }
            if (status === "REJECTED" && !rejectReason) {
                return res
                    .status(400)
                    .json({ error: "Reject korar karon likhte hobe (rejectReason)" });
            }
            const reviewerId = req.user?.id;
            if (!reviewerId) {
                return res.status(401).json({ error: "Login dorkar" });
            }
            const hajjah = await hajjahService.reviewHajjah(id, status, reviewerId, rejectReason);
            return res
                .status(200)
                .json({ message: `Hajjah ${status.toLowerCase()} successfully`, hajjah });
        }
        catch (error) {
            return handleError(res, error, "Failed to update status");
        }
    },
    // DELETE /api/hajjah/:id
    async deleteHajjah(req, res) {
        try {
            const id = getRouteParamId(req.params.id);
            await assertCanModify(req, id);
            await hajjahService.deleteHajjah(id);
            return res.status(200).json({ message: "Hajjah deleted successfully" });
        }
        catch (error) {
            return handleError(res, error, "Failed to delete hajjah");
        }
    },
};
// PUT ar PATCH er common logic
async function updateHandler(mode, req, res) {
    try {
        const id = getRouteParamId(req.params.id);
        await assertCanModify(req, id);
        const { data, missing, invalid } = buildHajjahData(req.body, mode);
        // Agent onno agent ke hajjah dite parbe na.
        // Admin agentId na pathale PUT jeno agent muche na fele.
        if (req.user?.role !== "admin" || req.body.agentId === undefined) {
            delete data.agentId;
        }
        if (missing.length > 0) {
            return res.status(400).json({
                error: "Missing required fields",
                missingFields: missing,
            });
        }
        if (invalid.length > 0) {
            return res.status(400).json({
                error: "Invalid values",
                invalidFields: invalid,
            });
        }
        // Notun photo dile update hobe, na dile ager photo/URL thakbe
        const photoPath = getUploadedPhotoPath(req.file) ?? req.body.photo;
        if (photoPath)
            data.photo = photoPath;
        if (Object.keys(data).length === 0) {
            return res.status(400).json({ error: "Update korar moto kono data nei" });
        }
        const updatedHajjah = await hajjahService.updateHajjah(id, data);
        return res
            .status(200)
            .json({ message: "Hajjah updated successfully", updatedHajjah });
    }
    catch (error) {
        return handleError(res, error, "Failed to update hajjah");
    }
}
//# sourceMappingURL=hajjah.controller.js.map