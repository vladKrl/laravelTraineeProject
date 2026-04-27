'use client'

import {useState} from "react";
import api from "../../../utils/api";
import Select from "../SelectDefault";
import Label from "../Label";
import Button from "../Button";

export default function ArchiveModal ({ product, isOpen, onClose, onWasArchived }) {
    const [selectedBuyerOption, setSelectedBuyerOption] = useState('');

    const [saving, setSaving] = useState(false);

    const buyerOptions = [
        { value: 'deleted', label: "Want to remove from public" },
        { value: 'sold_not_here', label: "Don't want to pick / Sold not here" },
        ...(product.conversations?.map(conv => ({
            value: conv.interlocutor.id,
            label: conv.interlocutor.name
        })) || [])
    ];

    const handleConfirm = async () => {
        setSaving(true);

        let reason;
        let buyerId = null;

        switch (selectedBuyerOption) {
            case 'deleted':
                reason = 'deleted';
                break;
            case 'sold_not_here':
            case '':
                reason = 'sold_not_here'
                break;
            default:
                reason = 'sold';
                buyerId = selectedBuyerOption;
        }

        try {
            const response = await api.patch(`/api/products/${product.id}/toggleArchive`, {
                archive_reason: reason,
                buyer_id: buyerId,
            });

            onWasArchived(response.data.data);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={"fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"}>
            <div className={"bg-white rounded-xl max-w-md w-full p-6 shadow-2xl"}>
                <h2 className={"text-xl font-bold mb-2"}>End the deal</h2>
                <p className={"text-gray-600 mb-6 text-sm"}>
                    Who bought this product?
                    You can pick to let your Buyer make a review!
                </p>

                <div className="mb-6">
                    <Label className={"text-sm font-medium mb-2"}>Choose the Buyer:</Label>
                    <Select
                        isMulti={false}
                        options={buyerOptions}
                        id={'users'}
                        instanceId={'users'}
                        name={'users'}
                        className={"w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"}
                        value={buyerOptions.find(opt => opt.value === selectedBuyerOption) || buyerOptions[0]}
                        onChange={(e) => setSelectedBuyerOption(e ? e.value : '')}
                    />
                </div>

                <div className={"flex gap-3"}>
                    <Button
                        onClick={onClose}
                        className={"border hover:bg-gray-50 transition"}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Confirm'}
                    </Button>
                </div>
            </div>
        </div>
    );
}