# AI or Human

เกม kiosk ทายภาพว่าเป็น AI หรือ Human

## เริ่มใช้งาน
```bash
npm install
npm run dev
```

## ของที่เก็บแบบ local
- รูปภาพ: `public/dataset/ai/` และ `public/dataset/human/`
- manifest: `public/dataset/manifest.json` (generate จากไฟล์ในโฟลเดอร์)
- ฐานข้อมูล: `data/game.db`

## เปลี่ยนรูปจริง
1. วางไฟล์ `.svg` / `.png` / `.jpg` ในโฟลเดอร์ `public/dataset/ai/` หรือ `public/dataset/human/`
2. รัน `npm run seed:manifest`
3. เปิดเกมใหม่

## ดีบัก label
- ตั้ง `NEXT_PUBLIC_DEBUG_LABELS=true` เพื่อแสดง watermark ชื่อ category/ไฟล์บนภาพในโหมด dev

## คะแนน
- ถูก: 100
- โบนัสเวลา: `floor(remainingSeconds * 10)`
- ตัวคูณคอมโบ: `1 + min(streakCount, 10) * 0.1`
- ผิดหรือหมดเวลา: 0 คะแนน และเสีย 1 หัวใจ
