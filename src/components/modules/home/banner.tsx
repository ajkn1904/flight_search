import { Plane } from 'lucide-react';
import { SearchFlight } from './searchFlight';
import banner from '@/assets/flight_banner.jpg';


export function Banner() {
    return (
        <div className="relative min-h-[600px] w-full overflow-hidden pb-24">

            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${banner})`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-emerald-900/70" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>



            <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center text-center pt-8">
                    <div className="mb-2 flex items-center justify-center gap-3">
                        <Plane className="h-12 w-12 text-green-400" />
                        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                            Find Your Perfect Flight
                        </h1>
                    </div>
                    <p className="mx-auto max-w-2xl text-lg text-green-50 sm:text-xl">
                        Search and compare flights from hundreds of airlines worldwide
                    </p>
                </div>


                <div className="relative mx-auto mt-6 max-w-5xl">
                    <SearchFlight />
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>
    );
}