'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MapComponent from '@/components/MapComponent';
import { Destination } from '@/types';

export default function DestinationDetailPage() {
  const params = useParams();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Decode destination name from URL
    const name = decodeURIComponent(params.name as string);

    // In real app, fetch from API
    // For now, use dummy data
    const dummyDestinations: { [key: string]: Destination } = {
      'Pusat Oleh-Oleh Bu Rudy': {
        place_id: 'dummy-detail-1',
        order: 1,
        nama: 'Pusat Oleh-Oleh Bu Rudy',
        kategori: ['belanja', 'wisata_kuliner'],
        coordinates: [-7.2575, 112.7521],
        deskripsi:
          'Pusat oleh-oleh Bu Rudy merupakan destinasi belanja favorit wisatawan yang berkunjung ke Surabaya. Tempat ini menawarkan berbagai macam oleh-oleh khas Surabaya dengan harga terjangkau. Mulai dari kue-kue tradisional, keripik, sambal, hingga kerajinan tangan lokal tersedia di sini.',
        alamat: 'Jl. Kembang Jepun No.1, Surabaya',
        jam_buka: '08:00 - 21:00 WIB',
        rating: 4.5,
      },
      'Nasi Goreng Kambing': {
        place_id: 'dummy-detail-2',
        order: 2,
        nama: 'Nasi Goreng Kambing',
        kategori: ['makanan_berat', 'halal', 'wisata_kuliner'],
        coordinates: [-7.2456, 112.7378],
        deskripsi:
          'Nasi Goreng Kambing adalah kuliner legendaris Surabaya yang wajib dicoba. Dengan cita rasa yang khas dan daging kambing yang empuk, hidangan ini telah menjadi favorit masyarakat Surabaya sejak puluhan tahun lalu. Porsi yang besar dan harga yang terjangkau membuat tempat ini selalu ramai pengunjung.',
        alamat: 'Jl. Walikota Mustajab No.35, Surabaya',
        jam_buka: '18:00 - 02:00 WIB',
        rating: 4.7,
      },
      'Taman Bunga': {
        place_id: 'dummy-detail-3',
        order: 3,
        nama: 'Taman Bunga',
        kategori: ['wisata_alam'],
        coordinates: [-7.2389, 112.7289],
        deskripsi:
          'Taman Bunga adalah destinasi wisata yang sempurna untuk bersantai dan menikmati keindahan alam. Dengan berbagai jenis bunga berwarna-warni yang ditata apik, taman ini menjadi spot foto favorit bagi pengunjung. Suasana yang sejuk dan asri membuat taman ini cocok untuk dikunjungi bersama keluarga.',
        alamat: 'Jl. Ahmad Yani, Surabaya',
        jam_buka: '06:00 - 18:00 WIB',
        rating: 4.3,
      },
    };

    setDestination(
      dummyDestinations[name] || {
        place_id: 'dummy-default',
        order: 1,
        nama: name,
        kategori: ['wisata'],
        coordinates: [-7.2458, 112.7378],
        deskripsi:
          'Informasi detail destinasi ini sedang dalam proses pembaruan.',
        rating: 4.0,
      }
    );
  }, [params.name]);

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const categoryLabels: { [key: string]: string } = {
    makanan_berat: 'Makanan Berat',
    makanan_ringan: 'Makanan Ringan',
    halal: 'Halal',
    wisata_alam: 'Wisata Alam',
    wisata_budaya: 'Wisata Budaya',
    wisata_kuliner: 'Wisata Kuliner',
    belanja: 'Belanja',
    hiburan: 'Hiburan',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-[400px] w-full">
        <Image
          src={
            destination.gambar ||
            `https://picsum.photos/seed/${destination.nama}/1920/800`
          }
          alt={destination.nama}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-6 left-6 right-6 md:left-12 md:right-12">
          <div className="flex items-center gap-2 text-white">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <Link href="/routes" className="hover:underline">
              Rute
            </Link>
            <span>/</span>
            <span className="font-semibold">{destination.nama}</span>
          </div>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {destination.nama}
            </h1>
            <div className="flex flex-wrap gap-2">
              {destination.kategori.map((kat, idx) => (
                <span
                  key={idx}
                  className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm"
                >
                  {categoryLabels[kat] || kat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Rating & Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-6 mb-6">
                {destination.rating && (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">⭐</span>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">
                        {destination.rating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Tentang Destinasi
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {destination.deskripsi}
              </p>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destination.alamat && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <span className="text-2xl">📍</span>
                    <div>
                      <div className="font-semibold text-gray-800 mb-1">
                        Alamat
                      </div>
                      <div className="text-gray-600">{destination.alamat}</div>
                    </div>
                  </div>
                )}
                {destination.jam_buka && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <span className="text-2xl">🕐</span>
                    <div>
                      <div className="font-semibold text-gray-800 mb-1">
                        Jam Buka
                      </div>
                      <div className="text-gray-600">
                        {destination.jam_buka}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Lokasi</h2>
              {isClient && (
                <MapComponent
                  destinations={[destination]}
                  userLocation={destination.coordinates}
                  height="400px"
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Koordinat
              </h3>
              <div className="space-y-3 mb-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Latitude</div>
                  <div className="font-mono text-gray-800 bg-gray-50 p-2 rounded">
                    {destination.coordinates[0]}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Longitude</div>
                  <div className="font-mono text-gray-800 bg-gray-50 p-2 rounded">
                    {destination.coordinates[1]}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={`https://www.google.com/maps?q=${destination.coordinates[0]},${destination.coordinates[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Buka di Google Maps
                </a>
                <Link
                  href="/routes"
                  className="block w-full text-center bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Buat Rute
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
