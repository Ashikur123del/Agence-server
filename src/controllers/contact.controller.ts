import { Request, Response } from "express";
import { ContactService } from "../services/contact.service.js";

export const ContactController = {
    async create(req: Request, res: Response) {
        try {
            const { name, phone, email, service, message } = req.body;

            if (!name || !phone || !message) {
                return res.status(400).json({
                    success: false,
                    message: "Name, phone, and message are required",
                });
            }

            const newContact = await ContactService.createContact({
                name,
                phone,
                email,
                service,
                message,
            });

            res.status(201).json({
                success: true,
                message: "Message sent successfully",
                data: newContact,
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getAll(req: Request, res: Response) {
        try {
            const contacts = await ContactService.getAllContacts();
            res.status(200).json({ success: true, data: contacts });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getById(req: Request, res: Response) {
        try {
            const rawId = req.params.id;
            const id = Array.isArray(rawId) ? rawId[0] : rawId;
            const contact = await ContactService.getContactById(id);

            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: "Contact message not found",
                });
            }
            res.status(200).json({ success: true, data: contact });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async updateStatus(req: Request, res: Response) {
        try {
            const rawId = req.params.id;
            const id = Array.isArray(rawId) ? rawId[0] : rawId;
            const { isRead } = req.body;

            const updated = await ContactService.updateContactStatus(id, isRead);
            res.status(200).json({
                success: true,
                message: "Contact status updated successfully",
                data: updated,
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const rawId = req.params.id;
            const id = Array.isArray(rawId) ? rawId[0] : rawId;
            const updateData = req.body;

            const updatedContact = await ContactService.updateContact(id, updateData);

            if (!updatedContact) {
                return res.status(404).json({
                    success: false,
                    message: "Contact message not found for update",
                });
            }

            res.status(200).json({
                success: true,
                message: "Contact message updated successfully",
                data: updatedContact,
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },


    async remove(req: Request, res: Response) {
        try {
            const rawId = req.params.id;
            const id = Array.isArray(rawId) ? rawId[0] : rawId;

            await ContactService.deleteContact(id);
            res.status(200).json({
                success: true,
                message: "Message deleted successfully",
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
};