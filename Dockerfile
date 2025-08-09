# ใช้ base image เป็น oven/bun เวอร์ชัน 1.1 ที่มี Bun runtime พร้อมใช้งาน
FROM oven/bun:1.1

# กำหนด working directory ภายใน container เป็น /app
WORKDIR /app

# คัดลอกไฟล์ bun.lock และ package.json ลงใน container
COPY bun.lock package.json ./

# ติดตั้ง bun install
RUN bun install

# คัดลอกไฟล์ทั้งหมดในโปรเจกต์
COPY . .

# รันคำสั่ง build โดยใช้ bun เพื่อสร้างไฟล์ที่จำเป็นสำหรับการรันแอป
RUN bun run build

# เปิดพอร์ต 6009 เพื่อรอรับการเชื่อมต่อจากภายนอก
EXPOSE 6009

# รันคำสั่งเริ่มต้นเมื่อ container ถูกสตาร์ท ให้รันคำสั่ง start ด้วย bun
CMD ["bun", "run", "start"]