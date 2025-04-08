document.addEventListener("DOMContentLoaded", () => {
    const countdownElement = document.getElementById("time-remaining");
    const countdownDuration = 60 * 60 * 1000;

    let startTime = localStorage.getItem("countdownStartTime");
    
    if (!startTime) {
        startTime = Date.now();
        localStorage.setItem("countdownStartTime", startTime);
    } else {
        startTime = parseInt(startTime, 10);
    }

    const interval = setInterval(() => {
        const currentTime = Date.now();
        const timePassed = currentTime - startTime;
        const timeRemaining = countdownDuration - timePassed;

        if (timeRemaining <= 0) {
            countdownElement.textContent = "Время истекло!";
            clearInterval(interval);
            localStorage.removeItem("countdownStartTime");
        } else {
            const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
            const seconds = Math.floor((timeRemaining / 1000) % 60);
            countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }
    }, 1000);
});
