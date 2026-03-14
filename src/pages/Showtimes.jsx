import React, { useState } from 'react';
import { Button } from '../components/ui';
import ShowtimeModal from '../components/features/showtime/ShowtimeModal';

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

            <ShowtimeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default Showtimes;
