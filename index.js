// URL ที่ได้จากขั้นตอน Deployment ใน Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbwodium0NLefm5fqW9YDuJMVgcNk8g2pEMHpqlbd5-siqvYp9s_hdKY6GchejiR6Yc6OQ/exec";

let TEACHER_PASSWORD = ""; // 🔑 รหัสผ่านสำหรับครู จะถูกเติมจาก Sheet
let FORM_LINK = "";        // จะถูกเติมจาก Sheet

// ฟังก์ชันดึงข้อมูลจาก Google Sheets
async function loadConfig() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        TEACHER_PASSWORD = data.pass.toString();
        FORM_LINK = data.link;

        // นำลิงก์ไปใส่ใน iframe
        const iframe = document.querySelector('iframe');
        if (iframe) {
            iframe.src = FORM_LINK;
        }
        
        console.log("โหลดข้อมูลสำเร็จ");
    } catch (error) {
        console.error("โหลดข้อมูลไม่สำเร็จ:", error);
        alert("เกิดข้อผิดพลาดในการโหลดข้อสอบ กรุณาติดต่อครู");
    }
}

// เรียกใช้ฟังก์ชันทันทีที่โหลดหน้าเว็บ
loadConfig();


const overlay = document.getElementById("lock-overlay");
const displayCount = document.getElementById("display-count");

// --- 1. เช็คสถานะตอนโหลดหน้า (ป้องกันการ Refresh) ---
window.onload = () => {
  const isLocked = localStorage.getItem("isLocked");
  const currentCount = localStorage.getItem("awayCount") || 0;

  // อัปเดตตัวเลขจำนวนครั้งที่ทำผิดไว้รอเลย
  displayCount.innerText = currentCount;

  if (isLocked === "true") {
    showLock();
  }
};

// --- 2. ตรวจจับการสลับหน้าจอ ---
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // เพิ่มจำนวนครั้ง
    let count = parseInt(localStorage.getItem("awayCount") || -1);
    count++;
    localStorage.setItem("awayCount", count);
    displayCount.innerText = count;

    // ล็อกหน้าจอ
    if (count <= 0) {
    } else {
      localStorage.setItem("isLocked", "true");
      showLock();
    }
  }
});

function showLock() {
  overlay.style.display = "block";
}

// --- 3. ปลดล็อกโดยครู ---
function unlockScreen() {
  const pass = prompt("กรุณาใส่รหัสผ่านครูเพื่อดำเนินการต่อ:");
  if (pass === TEACHER_PASSWORD) {
    localStorage.setItem("isLocked", "false");
    overlay.style.display = "none";
  } else if (pass !== null) {
    alert("รหัสไม่ถูกต้อง!");
  }
}

// --- 4. ฟังก์ชันล้างค่า (เรียกใช้เมื่อส่งข้อสอบเสร็จ) ---
// คุณสามารถเพิ่มปุ่ม "ส่งข้อสอบ" ในหน้าเว็บเราเพื่อให้เด็กกดหลังทำฟอร์มเสร็จ
function resetExamStatus() {
  const pass = prompt("กรุณาใส่รหัสผ่านครูเพื่อดำเนินการต่อ:");
  if (confirm("ยืนยันว่าส่งข้อสอบสำเร็จและต้องการล้างประวัติ?")) {
    if (pass === TEACHER_PASSWORD) {
      localStorage.removeItem("isLocked");
      localStorage.removeItem("awayCount");
      alert("ล้างข้อมูลเรียบร้อย");
      window.location.reload();
    } else if (pass !== null) {
      alert("รหัสไม่ถูกต้อง!");
    }
  }
}

// ห้ามคลิกขวา/ค้างเพื่อ Copy
document.addEventListener("contextmenu", (event) => event.preventDefault());

// ห้าม Copy เนื้อหาข้อสอบ:
document.addEventListener("copy", (e) => {
  e.preventDefault();
  alert("ไม่อนุญาตให้คัดลอกข้อสอบครับ");
});

// ห้ามกดปุ่ม Ctrl+C, Ctrl+V, Ctrl+U (ดู Code)
document.addEventListener("keydown", (e) => {
  if (
    e.ctrlKey &&
    (e.key === "c" ||
      e.key === "v" ||
      e.key === "u" ||
      e.key === "s" ||
      e.key === "x")
  ) {
    e.preventDefault();
    alert("ไม่อนุญาตให้ใช้คีย์ลัดครับ");
  }
});
