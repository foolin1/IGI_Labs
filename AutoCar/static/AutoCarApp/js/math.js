
function factorial(n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}


const xValues = Array.from({ length: 101 }, (_, i) => (i - 50) / 10); 
const n = 10; 


const taylorValues = xValues.map(x => {
    let sum = 0;
    for (let k = 0; k <= n; k++) {
        sum += Math.pow(x, k) / factorial(k);
    }
    return sum;
});

const exactValues = xValues.map(x => math.exp(x));


const ctx = document.getElementById('expChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: xValues,
        datasets: [
            {
                label: 'Taylor Series (n = 10)',
                data: taylorValues,
                borderColor: 'blue',
                fill: false,
                tension: 0.2
            },
            {
                label: 'Exact e^x',
                data: exactValues,
                borderColor: 'red',
                fill: false,
                tension: 0.2
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animations: {
            duration: 1000
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'x',
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'y',
                },
                min: -10, 
                max: 50  
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: (context) =>
                        `y(${context.label}) = ${context.raw.toFixed(5)}`,
                },
            },
        }
    }
});