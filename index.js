// URL ที่ได้จากขั้นตอน Deployment ใน Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbwodium0NLefm5fqW9YDuJMVgcNk8g2pEMHpqlbd5-siqvYp9s_hdKY6GchejiR6Yc6OQ/exec";

let TEACHER_PASSWORD = ""; 
let FORM_LINK = "";        

const overlay = document.getElementById("lock-overlay");
const displayCount = document.getElementById("display-count");

// --- 1. ฟังก์ชันดึงข้อมูลจาก Google Sheets และเช็คสถานะล็อก ---
async function initExam() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        TEACHER_PASSWORD = data.pass.toString();
        FORM_LINK = data.link;

        // นำลิงก์ไปใส่ใน iframe
        const iframe = document.querySelector('iframe');
        if (iframe) { iframe.src = FORM_LINK; }
        
        console.log("โหลดข้อมูลและรหัสผ่านจาก Sheet สำเร็จ");

        // --- เช็คสถานะการล็อกต่อทันทีที่ได้รหัสผ่าน ---
        const isLocked = localStorage.getItem("isLocked");
        const currentCount = localStorage.getItem("awayCount") || 0;
        displayCount.innerText = currentCount;

        if (isLocked === "true") {
            if(parseInt(displayCount.innerText) > 0){showLock();}               
        }

    } catch (error) {
        console.error("โหลดข้อมูลไม่สำเร็จ:", error);
        alert("เกิดข้อผิดพลาดในการโหลดข้อสอบ กรุณาติดต่อครู");
    }
}

// เรียกใช้ฟังก์ชันเริ่มต้นเพียงตัวเดียว
initExam();

// --- 2. ตรวจจับการสลับหน้าจอ (เหมือนเดิมแต่ปรับ Logic เล็กน้อย) ---
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // ดึงค่าล่าสุดจาก localStorage มาบวกเพิ่ม
    let count = parseInt(localStorage.getItem("awayCount") || -1);
    count++;
    localStorage.setItem("awayCount", count);
    displayCount.innerText = count;

    // ล็อกหน้าจอ
    localStorage.setItem("isLocked", "true");
    if(parseInt(displayCount.innerText) > 0){showLock();}
  }
});

function showLock() {
  overlay.style.display = "block";
}

// --- 3. ปลดล็อกโดยครู ---
function unlockScreen() {
  const pass = prompt("กรุณาใส่รหัสผ่านครูเพื่อดำเนินการต่อ:");
  // ตรวจสอบว่า TEACHER_PASSWORD ไม่เป็นค่าว่างก่อนเทียบ
  if (TEACHER_PASSWORD && pass === TEACHER_PASSWORD) {
    localStorage.setItem("isLocked", "false");
    overlay.style.display = "none";
  } else if (pass !== null) {
    alert("รหัสไม่ถูกต้อง! หรือข้อมูลรหัสผ่านยังโหลดไม่เสร็จ");
  }
}

// --- 4. ฟังก์ชันล้างค่า (เหมือนเดิม) ---
function resetExamStatus() {
  const pass = prompt("กรุณาใส่รหัสผ่านครูเพื่อล้างประวัติ:");
  if (pass === TEACHER_PASSWORD) {
    if (confirm("ยืนยันว่าส่งข้อสอบสำเร็จและต้องการล้างประวัติ?")) {
      localStorage.removeItem("isLocked");
      localStorage.removeItem("awayCount");
      alert("ล้างข้อมูลเรียบร้อย");
      window.location.reload();
    }
  } else if (pass !== null) {
    alert("รหัสไม่ถูกต้อง!");
  }
}

// ... ส่วนของ EventListener ห้าม Copy (เหมือนเดิมที่คุณเขียนไว้) ...
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



