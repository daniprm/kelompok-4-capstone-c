import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Cache untuk dataset wisata
let wisataDataCache: string | null = null;

// Function untuk load dan parse CSV
function loadWisataData(): string {
  if (wisataDataCache) {
    return wisataDataCache;
  }

  try {
    const csvPath = path.join(
      process.cwd(),
      'src',
      'app',
      'api',
      'chat',
      'data_wisata_sby.csv'
    );
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    // Format data menjadi text yang mudah dibaca
    const destinations = parsed.data as Array<{
      nama_destinasi: string;
      kategori: string;
      latitude: string;
      longitude: string;
    }>;

    let formattedData = '# DATABASE DESTINASI WISATA SURABAYA\n\n';
    formattedData += `Total destinasi: ${destinations.length}\n\n`;

    // Group by kategori
    const byCategory: { [key: string]: typeof destinations } = {};

    destinations.forEach((dest) => {
      const categories = dest.kategori.split(',').map((c) => c.trim());
      categories.forEach((cat) => {
        if (!byCategory[cat]) {
          byCategory[cat] = [];
        }
        byCategory[cat].push(dest);
      });
    });

    // Format per kategori
    Object.keys(byCategory)
      .sort()
      .forEach((category) => {
        formattedData += `## Kategori: ${category.toUpperCase()}\n`;
        byCategory[category].forEach((dest) => {
          formattedData += `- ${dest.nama_destinasi} (${dest.latitude}, ${dest.longitude})\n`;
        });
        formattedData += '\n';
      });

    wisataDataCache = formattedData;
    return formattedData;
  } catch (error) {
    console.error('Error loading wisata data:', error);
    return 'Data wisata tidak tersedia.';
  }
}

const SYSTEM_PROMPT = `Kamu adalah asisten wisata virtual untuk kota Surabaya, Indonesia. 
Tugas kamu adalah membantu wisatawan mendapatkan informasi tentang:
- Tempat wisata di Surabaya (kuliner, budaya, alam, hiburan, belanja)
- Rekomendasi destinasi wisata
- Informasi umum tentang Surabaya
- Tips perjalanan di Surabaya
- Makanan khas Surabaya
- Transportasi di Surabaya

Kamu memiliki akses ke database lengkap destinasi wisata di Surabaya yang akan diberikan sebagai konteks.

Kamu harus:
- Selalu menjawab dalam bahasa Indonesia yang ramah dan informatif
- Gunakan data dari database untuk memberikan rekomendasi yang akurat
- Fokus HANYA pada topik wisata Surabaya
- Jika ditanya tentang topik di luar wisata Surabaya, dengan sopan arahkan kembali ke topik wisata Surabaya
- Berikan informasi yang akurat dan membantu
- Gunakan format Markdown untuk jawaban yang lebih terstruktur (bold, list, heading, dll)
- Gunakan emoji yang relevan untuk membuat percakapan lebih menarik
- Jika diminta rekomendasi, sebutkan nama destinasi yang spesifik dari database
- Kelompokkan rekomendasi berdasarkan kategori jika relevan

Jangan menjawab pertanyaan tentang:
- Politik, agama, atau topik sensitif
- Topik di luar wisata dan Surabaya
- Memberikan saran medis, hukum, atau finansial

Contoh pertanyaan yang bisa kamu jawab:
- "Tempat wisata apa yang bagus di Surabaya?"
- "Makanan khas Surabaya apa yang harus dicoba?"
- "Bagaimana cara ke Tugu Pahlawan?"
- "Rekomendasi restoran di Surabaya?"
- "Tempat belanja di Surabaya dimana?"`;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Load wisata data untuk konteks
    const wisataData = loadWisataData();

    // Build conversation history for context
    const chatHistory = history
      ? history.map((msg: { role: string; content: string }) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }))
      : [];

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [
            {
              text: 'Baik, saya siap membantu Anda dengan informasi wisata di Surabaya! 🏙️✨',
            },
          ],
        },
        {
          role: 'user',
          parts: [
            {
              text: `Berikut adalah database lengkap destinasi wisata di Surabaya yang bisa kamu gunakan untuk menjawab pertanyaan:\n\n${wisataData}`,
            },
          ],
        },
        {
          role: 'model',
          parts: [
            {
              text: `Terima kasih! Saya sudah menerima database lengkap ${
                wisataData.split('\n')[1]
              } di Surabaya. Saya siap memberikan rekomendasi yang akurat berdasarkan data ini! 🗺️`,
            },
          ],
        },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      message: text,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
