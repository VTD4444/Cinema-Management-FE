import React from 'react';
import UserLayout from '../components/layout/UserLayout';
import { Play } from 'lucide-react';

const AboutUs = () => {
  const partners = ['IMAX', 'DOLBY', 'SONY', 'COCA-COLA', 'MOMO', 'ZALOPAY'];

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#0e0e0e] text-white">
        <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
          
          {/* Header */}
          <div className="mb-14">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">Về chúng tôi</h1>
            <p className="text-zinc-400 text-sm">
              Khám phá câu chuyện và sứ mệnh mang điện ảnh đến gần bạn hơn của CinemaPlus.
            </p>
          </div>

          {/* Section 1: Intro */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
            {/* Left Col: Text & Stats */}
            <div className="flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-4 mb-6">
                  <span className="w-1 h-6 bg-red-600 rounded-full"></span>
                  Giới thiệu chung về rạp
                </h2>
                <p className="text-zinc-300 text-sm leading-relaxed mb-4 text-justify">
                  CinemaPlus được thành lập với niềm đam mê cháy bỏng: mang lại trải nghiệm điện ảnh tuyệt vời nhất cho khán giả Việt Nam. Chúng tôi tự hào là hệ thống rạp chiếu phim tiên phong trong việc áp dụng các công nghệ chiếu phim hiện đại nhất thế giới như IMAX Laser, Dolby Atmos 7.1.
                </p>
                <p className="text-zinc-300 text-sm leading-relaxed text-justify">
                  Với không gian sang trọng, ghế ngồi êm ái và màn hình sắc nét, mỗi bộ phim tại CinemaPlus đều là một tác phẩm nghệ thuật trọn vẹn. Đội ngũ nhân viên chuyên nghiệp của chúng tôi luôn sẵn sàng phục vụ để đảm bảo bạn có những giây phút giải trí thoải mái nhất.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-zinc-800">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-1">50+</h3>
                  <p className="text-[#a0a0a0] text-[10px] uppercase font-bold tracking-wider">Rạp chiếu toàn quốc</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-1">200+</h3>
                  <p className="text-[#a0a0a0] text-[10px] uppercase font-bold tracking-wider">Phòng chiếu hiện đại</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-1">1M+</h3>
                  <p className="text-[#a0a0a0] text-[10px] uppercase font-bold tracking-wider">Khách hàng tin dùng</p>
                </div>
              </div>
            </div>

            {/* Right Col: Image */}
            <div className="relative rounded-3xl overflow-hidden bg-zinc-900 aspect-[4/3] border border-zinc-800 shadow-2xl">
              {/* Fake Image Background */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a1c29] to-[#0d0e15] flex flex-col items-center justify-center">
                
                {/* Simulated Screen */}
                <div className="w-[80%] h-[40%] bg-blue-900/40 border border-blue-500/20 rounded-lg relative overflow-hidden flex flex-col items-center justify-center transform -translate-y-10 shadow-[0_0_80px_rgba(29,78,216,0.3)]">
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
                  <h3 className="relative text-3xl font-black text-white tracking-widest uppercase">Cinemal</h3>
                  <p className="relative text-[10px] font-bold text-blue-200 tracking-widest mt-1">SAFE IN NETWORK</p>
                </div>

                {/* Simulated Seats */}
                <div className="absolute bottom-0 w-full h-[40%] flex gap-2 px-8 mask-image: linear-gradient(to top, black, transparent)">
                   <div className="w-1/4 h-32 bg-zinc-800/80 rounded-t-xl shrink-0 translate-y-8"></div>
                   <div className="w-1/4 h-32 bg-zinc-800/90 rounded-t-xl shrink-0 translate-y-4"></div>
                   <div className="w-1/4 h-32 bg-zinc-800 rounded-t-xl shrink-0"></div>
                   <div className="w-1/4 h-32 bg-zinc-800/90 rounded-t-xl shrink-0 translate-y-4"></div>
                   <div className="w-1/4 h-32 bg-zinc-800/80 rounded-t-xl shrink-0 translate-y-8"></div>
                </div>
              </div>

              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent flex flex-col justify-end p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">Premium</span>
                  <span className="text-[10px] font-bold bg-zinc-800 text-white px-2 py-0.5 rounded uppercase tracking-wider">Comfort</span>
                </div>
                <p className="text-xl md:text-2xl font-bold tracking-tight text-white">&quot;Nơi cảm xúc thăng hoa cùng điện ảnh&quot;</p>
              </div>
            </div>
          </section>

          {/* Section 2: Journey Video */}
          <section className="mb-24">
             <div className="w-full aspect-video rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 relative mb-6 group cursor-pointer shadow-2xl">
               {/* Blurred background simulate video thumb */}
               <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-700 to-red-900/20 opacity-40"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-20 h-20 rounded-full bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.6)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-white ml-2" fill="currentColor" />
                 </div>
               </div>
               
               {/* Bottom info bar simulating video player */}
               <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between">
                 <div>
                   <h3 className="text-lg font-bold text-white mb-1">Hành trình CinemaPlus</h3>
                   <p className="text-xs text-zinc-400">Khám phá quá trình hình thành và phát triển của hệ thống rạp chiếu phim hàng đầu.</p>
                 </div>
                 <button className="text-xs font-bold text-red-500 hover:text-red-400 hidden sm:block">
                   Xem tất cả video →
                 </button>
               </div>
             </div>
          </section>

          {/* Section 3: Partners */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-10">Đối tác đồng hành</h2>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {partners.map((partner, index) => (
                <div 
                  key={index} 
                  className="w-32 sm:w-40 h-16 sm:h-20 bg-[#161616] border border-zinc-800/80 rounded-2xl flex items-center justify-center hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-lg sm:text-xl font-black text-zinc-500 tracking-widest">{partner}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </UserLayout>
  );
};

export default AboutUs;
