"use client";

export default function DashboardTest() {
  return (
    <div className="bg-[#ededed] overflow-hidden min-h-screen">
      <div className="flex gap-5 max-lg:flex-col max-lg:gap-0">
        <div className="flex flex-col w-[17%] max-lg:w-full max-lg:ml-0">
          <div className="w-full bg-[#28A428] text-white mx-auto pt-10 px-4 pb-[806px] max-lg:pb-[100px]">
            <div className="flex w-full items-center gap-2.5 font-['Nico_Moji',sans-serif] justify-center">
              <img
                src="/images/logo-white.svg"
                alt="Kibang Logo"
                className="aspect-square object-contain object-center w-10 shrink-0"
              />
              <div className="w-[110px]">
                <div className="text-2xl">Kibang</div>
                <div className="text-sm mt-2">Soil Tracker</div>
              </div>
            </div>
            <div className="mt-10 w-full whitespace-nowrap max-lg:whitespace-normal font-['Inter',sans-serif] text-sm">
              <div className="items-center rounded-[10px] flex w-full gap-3 justify-start max-lg:whitespace-normal bg-[#165C16] p-2">
                <img
                  src="/images/home.svg"
                  alt="Home"
                  className="aspect-square object-contain object-center w-6 shrink-0"
                />
                <div>Beranda</div>
              </div>
              <div className="mt-3 w-full max-lg:whitespace-normal">
                <div className="rounded-[10px] flex w-full items-center gap-3 justify-start max-lg:whitespace-normal p-2">
                  <img
                    src="/images/history.svg"
                    alt="History"
                    className="aspect-square object-contain object-center w-6 shrink-0"
                  />
                  <div>Riwayat</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-[83%] ml-5 max-lg:w-full max-lg:ml-0">
          <div className="w-full max-lg:max-w-full">
            <div className="flex min-h-[80px] items-center gap-5 justify-end flex-wrap px-5">
              <img
                src="/images/notif.svg"
                alt="Notifications"
                className="aspect-square object-contain object-center w-[50px] shrink-0"
              />
              <img
                src="/images/profile.svg"
                alt="Profile"
                className="aspect-square object-contain object-center w-[50px] shrink-0"
              />
            </div>
            <div className="flex mt-1.5 min-h-[938px] w-full flex-col items-stretch justify-start max-lg:max-w-full">
              <div className="shadow-[0px_4px_4px_rgba(0,0,0,0.25)] flex w-full items-center gap-10 font-['Inter',sans-serif] text-[#333] justify-center flex-wrap max-lg:max-w-full">
                <div className="metric-card items-stretch rounded-[10px] flex min-w-[240px] min-h-[130px] flex-col whitespace-nowrap max-lg:whitespace-normal justify-start w-[280px] bg-[#E0F8E0] my-auto py-3 px-3 pb-[34px]">
                  <div className="text-xl font-normal">PH</div>
                  <div className="text-[40px] font-semibold text-center self-start mt-3">
                    6
                  </div>
                </div>
                <div className="metric-card items-stretch rounded-[10px] flex min-w-[240px] min-h-[130px] flex-col justify-start w-[280px] bg-[#E0F8E0] my-auto py-3 px-3 pb-[34px]">
                  <div className="text-xl font-normal">Suhu (°C)</div>
                  <div className="text-[40px] font-semibold text-center self-start mt-3">
                    30
                  </div>
                </div>
                <div className="metric-card items-stretch rounded-[10px] flex min-w-[240px] min-h-[130px] flex-col whitespace-nowrap max-lg:whitespace-normal justify-start w-[280px] bg-[#E0F8E0] my-auto py-3 px-3 pb-[34px]">
                  <div className="text-xl font-normal">Kelembaban</div>
                  <div className="text-[40px] font-semibold text-center self-start mt-3">
                    20
                  </div>
                </div>
              </div>
              <div className="charts-container items-start content-start flex-wrap rounded-[10px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] self-center flex mt-[35px] w-[920px] max-w-full gap-10 lg:gap-[120px] justify-start max-lg:px-5 bg-[#BFF0BF] p-10">
                <div className="min-w-[240px] grow shrink basis-0 w-[279px]">
                  <div className="text-[#333] font-normal text-xl font-['Inter',sans-serif]">
                    PH
                  </div>
                  <div className="chart-axes rounded-none flex mt-3 max-w-full w-[349px] items-stretch">
                    <div className="y-axis w-px shrink-0 h-[257px] border border-black" />
                    <div className="x-axis self-end mt-64 shrink grow basis-auto max-lg:mt-10 h-px border border-black" />
                  </div>
                </div>
                <div className="min-w-[240px] grow shrink basis-0 w-[279px]">
                  <div className="text-[#333] font-normal text-xl font-['Inter',sans-serif]">
                    Suhu (°C)
                  </div>
                  <div className="chart-axes rounded-none flex mt-3 max-w-full w-[349px] items-stretch">
                    <div className="y-axis w-px shrink-0 h-[257px] border border-black" />
                    <div className="x-axis self-end mt-64 shrink grow basis-auto max-lg:mt-10 h-px border border-black" />
                  </div>
                </div>
                <div className="min-w-[240px] grow shrink basis-0 w-[279px]">
                  <div className="text-[#333] font-normal text-xl font-['Inter',sans-serif]">
                    Kelembaban
                  </div>
                  <div className="chart-axes rounded-none flex mt-3 max-w-full w-[349px] items-stretch">
                    <div className="y-axis w-px shrink-0 h-[257px] border border-black" />
                    <div className="x-axis self-end mt-64 shrink grow basis-auto max-lg:mt-10 h-px border border-black" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
