"use client";

export default function DashboardHome() {
  return (
    <div className="max-w-[640px] mx-auto flex w-full flex-col items-center gap-5 p-3 box-border sm:max-w-[991px] sm:p-4 sm:gap-6 lg:max-w-6xl lg:p-5 lg:gap-9">
      {/* Metrics Cards */}
      <div className="flex flex-col justify-center items-center gap-5 w-full sm:flex-row sm:gap-5 lg:gap-10">
        <div className="flex w-full max-w-[400px] h-[150px] p-4 flex-col items-start gap-3 rounded-lg bg-green-100 shadow-lg box-border sm:w-[280px] sm:h-[130px] sm:p-3">
          <div className="self-stretch text-gray-800 font-inter text-lg sm:text-xl font-normal">PH</div>
          <div className="self-stretch text-gray-800 text-center font-inter text-3xl sm:text-4xl font-bold">6</div>
        </div>
        <div className="flex w-full max-w-[400px] h-[150px] p-4 flex-col items-start gap-3 rounded-lg bg-green-100 shadow-lg box-border sm:w-[280px] sm:h-[130px] sm:p-3">
          <div className="self-stretch text-gray-800 font-inter text-lg sm:text-xl font-normal">Suhu (°C)</div>
          <div className="self-stretch text-gray-800 text-center font-inter text-3xl sm:text-4xl font-bold">30</div>
        </div>
        <div className="flex w-full max-w-[400px] h-[150px] p-4 flex-col items-start gap-3 rounded-lg bg-green-100 shadow-lg box-border sm:w-[280px] sm:h-[130px] sm:p-3">
          <div className="self-stretch text-gray-800 font-inter text-lg sm:text-xl font-normal">Kelembaban</div>
          <div className="self-stretch text-gray-800 text-center font-inter text-3xl sm:text-4xl font-bold">20</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="flex w-full max-w-[600px] p-5 items-start content-start gap-5 flex-wrap rounded-lg bg-green-200 box-border sm:max-w-[920px] sm:p-6 sm:gap-6 sm:gap-x-[120px] lg:p-10 lg:gap-10">
        <div className="flex w-full max-w-[400px] flex-col items-start gap-3 flex-shrink-0 p-3 sm:p-4 lg:p-5 rounded-lg bg-white shadow-lg">
          <div className="self-stretch text-gray-800 font-inter text-lg sm:text-xl font-normal">PH</div>
          <div className="w-full h-[200px] sm:h-[257px] relative">
            <div className="w-3/4 h-0 absolute left-0 top-0 bg-black"></div>
            <div className="w-full h-0 absolute left-0 top-[200px] sm:top-[257px] bg-black"></div>
          </div>
        </div>
        <div className="flex w-full max-w-[400px] flex-col items-start gap-3 flex-shrink-0 p-3 sm:p-4 lg:p-5 rounded-lg bg-white shadow-lg">
          <div className="self-stretch text-gray-800 font-inter text-lg sm:text-xl font-normal">Suhu (°C)</div>
          <div className="w-full h-[200px] sm:h-[257px] relative">
            <div className="w-3/4 h-0 absolute left-0 top-0 bg-black"></div>
            <div className="w-full h-0 absolute left-0 top-[200px] sm:top-[257px] bg-black"></div>
          </div>
        </div>
        <div className="flex w-full max-w-[400px] flex-col items-start gap-3 flex-shrink-0 p-3 sm:p-4 lg:p-5 rounded-lg bg-white shadow-lg">
          <div className="self-stretch text-gray-800 font-inter text-lg sm:text-xl font-normal">Kelembaban</div>
          <div className="w-full h-[200px] sm:h-[257px] relative">
            <div className="w-3/4 h-0 absolute left-0 top-0 bg-black"></div>
            <div className="w-full h-0 absolute left-0 top-[200px] sm:top-[257px] bg-black"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
