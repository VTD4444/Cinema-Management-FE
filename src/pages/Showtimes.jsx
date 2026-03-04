import React, { useState } from 'react';
import { Button, Input, Modal, Select } from '../components/ui';

const Showtimes = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Danh sách suất chiếu</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    + Thêm suất chiếu
                </Button>
            </div>

            <div className="rounded-md border border-border bg-surface p-8 text-center text-gray-400 shadow-sm">
                Chưa có dữ liệu suất chiếu. UI sẽ được hoàn thiện sau.
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Thêm suất chiếu mới"
            >
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <Select label="Chọn phim" defaultValue="mai">
                        <option value="mai">Mai</option>
                        <option value="peach">Đào, Phở và Piano</option>
                        <option value="dune2">Dune: Part Two</option>
                    </Select>

                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Ngôn ngữ" defaultValue="longtieng">
                            <option value="longtieng">Lồng tiếng</option>
                            <option value="phude">Phụ đề</option>
                        </Select>
                        <Select label="Phòng chiếu" defaultValue="rap1">
                            <option value="rap1">Rạp 1</option>
                            <option value="rap2">Rạp 2</option>
                            <option value="rap3">Rạp 3</option>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Giờ bắt đầu" type="time" defaultValue="08:00" />
                        <Input label="Giờ kết thúc" type="time" defaultValue="10:00" />
                    </div>

                    <Input label="Giá vé cơ bản (VND)" type="text" defaultValue="85,000" />

                    <div className="flex justify-end gap-3 pt-4 mt-6">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-full px-6 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-gray-300 h-9">
                            Hủy
                        </Button>
                        <Button variant="primary" className="rounded-full px-6 bg-primary hover:bg-primary-hover h-9">
                            Lưu suất chiếu
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Showtimes;
