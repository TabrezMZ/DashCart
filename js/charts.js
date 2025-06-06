class ChartManager {
  constructor() {
    this.currentYear = "2023"
    this.charts = {}
    this.hoveredPoint = null
    this.init()
  }

  init() {
    this.initDateFilter()
    this.createCharts()
  }

  initDateFilter() {
    const dateFilterBtn = document.getElementById("dateFilterBtn")
    const dateDropdown = document.getElementById("dateDropdown")
    const selectedDateRange = document.getElementById("selectedDateRange")

    dateFilterBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      dateDropdown.classList.toggle("show")
    })

    document.addEventListener("click", () => {
      dateDropdown.classList.remove("show")
    })

    dateDropdown.addEventListener("click", (e) => {
      e.stopPropagation()
      if (e.target.classList.contains("date-option")) {
        const selectedYear = e.target.dataset.range
        this.currentYear = selectedYear

        // Update active state
        dateDropdown.querySelectorAll(".date-option").forEach((option) => {
          option.classList.remove("active")
        })
        e.target.classList.add("active")

        // Update button text
        selectedDateRange.textContent = e.target.textContent

        // Update charts
        this.updateCharts()

        // Close dropdown
        dateDropdown.classList.remove("show")
      }
    })
  }

  createCharts() {
    this.createRevenueChart()
    this.createProfitChart()
    this.createSessionsChart()
  }

  createRevenueChart() {
    const canvas = document.getElementById("revenueChart")
    const ctx = canvas.getContext("2d")

    // Add mouse event listeners for interactivity
    canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e, canvas))
    canvas.addEventListener("mouseleave", () => this.handleMouseLeave(canvas))

    this.charts.revenue = {
      canvas,
      ctx,
      draw: () => this.drawRevenueChart(ctx, canvas),
    }

    this.charts.revenue.draw()
  }

  handleMouseMove(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Scale for device pixel ratio
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const scaledMouseX = mouseX * scaleX
    const scaledMouseY = mouseY * scaleY

    const chartData = {
      2023: {
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        revenue: [60, 75, 65, 80, 70, 90, 80, 95, 85, 100, 90, 105],
        expenses: [40, 50, 45, 55, 50, 65, 60, 70, 65, 75, 70, 80],
      },
      2022: {
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        revenue: [50, 65, 55, 70, 60, 80, 70, 85, 75, 90, 80, 95],
        expenses: [30, 40, 35, 45, 40, 55, 50, 60, 55, 65, 60, 70],
      },
      2021: {
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        revenue: [40, 55, 45, 60, 50, 70, 60, 75, 65, 80, 70, 85],
        expenses: [20, 30, 25, 35, 30, 45, 40, 50, 45, 55, 50, 60],
      },
    }

    const data = chartData[this.currentYear]
    const padding = 60
    const chartWidth = canvas.width - padding * 2

    // Find the closest data point
    let closestIndex = -1
    let minDistance = Number.POSITIVE_INFINITY

    data.revenue.forEach((value, index) => {
      const x = padding + (chartWidth / (data.revenue.length - 1)) * index
      const distance = Math.abs(scaledMouseX - x)

      if (distance < minDistance && distance < 30) {
        minDistance = distance
        closestIndex = index
      }
    })

    if (closestIndex !== -1 && closestIndex !== this.hoveredPoint) {
      this.hoveredPoint = closestIndex
      canvas.style.cursor = "pointer"
      this.charts.revenue.draw()
    } else if (closestIndex === -1 && this.hoveredPoint !== null) {
      this.hoveredPoint = null
      canvas.style.cursor = "default"
      this.charts.revenue.draw()
    }
  }

  handleMouseLeave(canvas) {
    if (this.hoveredPoint !== null) {
      this.hoveredPoint = null
      canvas.style.cursor = "default"
      this.charts.revenue.draw()
    }
  }

  drawRevenueChart(ctx, canvas) {
    const data = chartData[this.currentYear]
    const width = canvas.width
    const height = canvas.height
    const padding = 60
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    ctx.clearRect(0, 0, width, height)

    // Find max value for scaling
    const maxValue = Math.max(...data.revenue, ...data.expenses)
    const scale = chartHeight / maxValue

    // Draw background grid
    ctx.strokeStyle = "#334155"
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      const value = Math.round((maxValue / 5) * (5 - i))

      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()

      // Y-axis labels
      ctx.fillStyle = "#64748b"
      ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(`${value}K`, padding - 10, y + 4)
    }

    // Vertical grid lines and month labels
    data.months.forEach((month, index) => {
      const x = padding + (chartWidth / (data.months.length - 1)) * index

      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()

      // X-axis labels
      ctx.fillStyle = "#64748b"
      ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(month, x, height - padding + 20)
    })

    ctx.setLineDash([])

    // Create smooth curves using bezier curves
    const createSmoothPath = (values, strokeOnly = false) => {
      const points = values.map((value, index) => ({
        x: padding + (chartWidth / (values.length - 1)) * index,
        y: height - padding - value * scale,
      }))

      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)

      for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1]
        const currentPoint = points[i]
        const nextPoint = points[i + 1]

        let cpx1, cpy1, cpx2, cpy2

        if (i === 1) {
          cpx1 = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.3
          cpy1 = prevPoint.y
        } else {
          const prevPrevPoint = points[i - 2]
          cpx1 = prevPoint.x + (currentPoint.x - prevPrevPoint.x) * 0.15
          cpy1 = prevPoint.y + (currentPoint.y - prevPrevPoint.y) * 0.15
        }

        if (i === points.length - 1) {
          cpx2 = currentPoint.x - (currentPoint.x - prevPoint.x) * 0.3
          cpy2 = currentPoint.y
        } else {
          cpx2 = currentPoint.x - (nextPoint.x - prevPoint.x) * 0.15
          cpy2 = currentPoint.y - (nextPoint.y - prevPoint.y) * 0.15
        }

        ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, currentPoint.x, currentPoint.y)
      }

      return points
    }

    // Draw revenue area fill
    const revenuePoints = createSmoothPath(data.revenue)
    if (!false) {
      ctx.lineTo(width - padding, height - padding)
      ctx.lineTo(padding, height - padding)
      ctx.closePath()

      const revenueGradient = ctx.createLinearGradient(0, padding, 0, height - padding)
      revenueGradient.addColorStop(0, "rgba(168, 85, 247, 0.3)")
      revenueGradient.addColorStop(1, "rgba(168, 85, 247, 0.05)")
      ctx.fillStyle = revenueGradient
      ctx.fill()
    }

    // Draw revenue line
    createSmoothPath(data.revenue, true)
    ctx.strokeStyle = "#A855F7"
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw expenses area fill
    createSmoothPath(data.expenses)
    ctx.lineTo(width - padding, height - padding)
    ctx.lineTo(padding, height - padding)
    ctx.closePath()

    const expensesGradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    expensesGradient.addColorStop(0, "rgba(59, 130, 246, 0.2)")
    expensesGradient.addColorStop(1, "rgba(59, 130, 246, 0.05)")
    ctx.fillStyle = expensesGradient
    ctx.fill()

    // Draw expenses line
    createSmoothPath(data.expenses, true)
    ctx.strokeStyle = "#3B82F6"
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw data points
    data.revenue.forEach((value, index) => {
      const x = padding + (chartWidth / (data.revenue.length - 1)) * index
      const y = height - padding - value * scale

      const isHovered = this.hoveredPoint === index
      const radius = isHovered ? 8 : 6

      // Outer circle
      ctx.fillStyle = "#A855F7"
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()

      // Inner circle
      ctx.fillStyle = "#1e293b"
      ctx.beginPath()
      ctx.arc(x, y, radius - 3, 0, Math.PI * 2)
      ctx.fill()

      // Hover effect
      if (isHovered) {
        ctx.strokeStyle = "#A855F7"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, radius + 4, 0, Math.PI * 2)
        ctx.stroke()
      }
    })

    data.expenses.forEach((value, index) => {
      const x = padding + (chartWidth / (data.expenses.length - 1)) * index
      const y = height - padding - value * scale

      const isHovered = this.hoveredPoint === index
      const radius = isHovered ? 8 : 6

      // Outer circle
      ctx.fillStyle = "#3B82F6"
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()

      // Inner circle
      ctx.fillStyle = "#1e293b"
      ctx.beginPath()
      ctx.arc(x, y, radius - 3, 0, Math.PI * 2)
      ctx.fill()

      // Hover effect
      if (isHovered) {
        ctx.strokeStyle = "#3B82F6"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, radius + 4, 0, Math.PI * 2)
        ctx.stroke()
      }
    })

    // Draw tooltip for hovered point
    if (this.hoveredPoint !== null) {
      const index = this.hoveredPoint
      const revenueValue = data.revenue[index]
      const expenseValue = data.expenses[index]
      const month = data.months[index]

      const x = padding + (chartWidth / (data.revenue.length - 1)) * index
      const y = height - padding - revenueValue * scale

      // Calculate percentage change (mock calculation)
      const prevValue = index > 0 ? data.revenue[index - 1] : revenueValue
      const percentChange = (((revenueValue - prevValue) / prevValue) * 100).toFixed(1)

      this.drawTooltip(ctx, x, y, {
        revenue: revenueValue,
        expenses: expenseValue,
        month: month,
        percentChange: percentChange,
        year: this.currentYear,
      })
    }
  }

  drawTooltip(ctx, x, y, data) {
    const tooltipWidth = 140
    const tooltipHeight = 80
    let tooltipX = x - tooltipWidth / 2
    let tooltipY = y - tooltipHeight - 20

    // Adjust tooltip position if it goes off screen
    if (tooltipX < 10) tooltipX = 10
    if (tooltipX + tooltipWidth > ctx.canvas.width - 10) tooltipX = ctx.canvas.width - tooltipWidth - 10
    if (tooltipY < 10) tooltipY = y + 30

    // Tooltip background with shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4

    ctx.fillStyle = "#1e293b"
    ctx.strokeStyle = "#334155"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 8)
    ctx.fill()
    ctx.stroke()

    // Reset shadow
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Tooltip content
    ctx.fillStyle = "#f8fafc"
    ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`$${data.revenue}K`, tooltipX + tooltipWidth / 2, tooltipY + 22)

    // Percentage change
    const changeColor = data.percentChange >= 0 ? "#10b981" : "#ef4444"
    const changeSign = data.percentChange >= 0 ? "+" : ""
    ctx.fillStyle = changeColor
    ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.fillText(`${changeSign}${data.percentChange}%`, tooltipX + tooltipWidth / 2, tooltipY + 40)

    // Date
    ctx.fillStyle = "#94a3b8"
    ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.fillText(`${data.month} ${data.year}`, tooltipX + tooltipWidth / 2, tooltipY + 55)

    // Expenses info
    ctx.fillStyle = "#3B82F6"
    ctx.fillText(`Expenses: $${data.expenses}K`, tooltipX + tooltipWidth / 2, tooltipY + 70)

    // Tooltip arrow
    ctx.fillStyle = "#1e293b"
    ctx.beginPath()
    if (tooltipY < y) {
      // Arrow pointing down
      ctx.moveTo(x - 6, tooltipY + tooltipHeight)
      ctx.lineTo(x + 6, tooltipY + tooltipHeight)
      ctx.lineTo(x, tooltipY + tooltipHeight + 8)
    } else {
      // Arrow pointing up
      ctx.moveTo(x - 6, tooltipY)
      ctx.lineTo(x + 6, tooltipY)
      ctx.lineTo(x, tooltipY - 8)
    }
    ctx.closePath()
    ctx.fill()
  }

  createProfitChart() {
    const canvas = document.getElementById("profitChart")
    const ctx = canvas.getContext("2d")

    this.charts.profit = {
      canvas,
      ctx,
      draw: () => this.drawProfitChart(ctx, canvas),
    }

    this.charts.profit.draw()
  }

 drawProfitChart(ctx, canvas) {
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;

  ctx.clearRect(0, 0, width, height);

  // Dummy profit data for 24 hours
  const profitData = [
    140, 110, 130, 90, 100, 180, 160, 200, 170, 220, 210, 250,
    230, 200, 190, 210, 220, 240, 200, 180, 160, 150, 130, 120,
  ];
  const timeLabels = ["12 AM", "8 AM", "4 PM", "11 PM"];
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxValue = 300;

  const barWidth = chartWidth / profitData.length - 4;

  // Draw bars
  profitData.forEach((value, index) => {
    const x = padding + index * (barWidth + 4);
    const y = height - padding - (value / maxValue) * chartHeight;
    const barHeight = (value / maxValue) * chartHeight;

    ctx.fillStyle = index % 2 === 0 ? "#A855F7" : "#22D3EE"; // purple / cyan
    ctx.fillRect(x, y, barWidth, barHeight);
  });

  // Draw time labels
  const labelPositions = [0, 8, 16, 23];
  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";

  labelPositions.forEach((pos, i) => {
    const x = padding + pos * (barWidth + 4) + barWidth / 2;
    ctx.fillText(timeLabels[i], x, height - 10);
  });
}


  createSessionsChart() {
    const canvas = document.getElementById("sessionsChart")
    const ctx = canvas.getContext("2d")

    this.charts.sessions = {
      canvas,
      ctx,
      draw: () => this.drawSessionsChart(ctx, canvas),
    }

    this.charts.sessions.draw()
  }

  drawSessionsChart(ctx, canvas) {
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
  
    ctx.clearRect(0, 0, width, height);
  
    // Sessions data over 24 hours
    const sessionsData = [
      120, 150, 180, 160, 140, 170, 190, 220, 200, 280, 320, 350,
      300, 250, 280, 320, 290, 260, 240, 200, 180, 160, 140, 120,
    ];
    const timeLabels = ["12 AM", "8 AM", "4 PM", "11 PM"];
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
  
    // Auto-scale Y-axis
    const maxValue = Math.max(...sessionsData) + 50; // Add buffer
    const ySteps = [0, Math.round(maxValue / 3), Math.round((maxValue * 2) / 3), maxValue];
  
    // Y-axis labels
    ctx.fillStyle = "#64748b";
    ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "right";
  
    ySteps.forEach((value) => {
      const y = height - padding - (value / maxValue) * chartHeight;
      ctx.fillText(value.toString(), padding - 10, y + 4);
    });
  
    // Compute points
    const points = sessionsData.map((value, index) => ({
      x: padding + (chartWidth / (sessionsData.length - 1)) * index,
      y: height - padding - (value / maxValue) * chartHeight,
    }));
  
    // Area fill
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.lineTo(point.x, point.y);
      } else {
        const prev = points[index - 1];
        const cp1x = prev.x + (point.x - prev.x) * 0.3;
        const cp1y = prev.y;
        const cp2x = point.x - (point.x - prev.x) * 0.3;
        const cp2y = point.y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, point.x, point.y);
      }
    });
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();
  
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, "rgba(168, 85, 247, 0.3)");
    gradient.addColorStop(1, "rgba(168, 85, 247, 0.05)");
    ctx.fillStyle = gradient;
    ctx.fill();
  
    // Draw smooth line
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        const prev = points[index - 1];
        const cp1x = prev.x + (point.x - prev.x) * 0.3;
        const cp1y = prev.y;
        const cp2x = point.x - (point.x - prev.x) * 0.3;
        const cp2y = point.y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, point.x, point.y);
      }
    });
    ctx.strokeStyle = "#A855F7";
    ctx.lineWidth = 3;
    ctx.stroke();
  
    // Data points
    points.forEach((point) => {
      ctx.fillStyle = "#A855F7";
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
  
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  
    // Time labels
    const labelPositions = [0, 8, 16, 23];
    ctx.fillStyle = "#64748b";
    ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
  
    labelPositions.forEach((pos, index) => {
      const x = padding + (chartWidth / (sessionsData.length - 1)) * pos;
      ctx.fillText(timeLabels[index], x, height - 10);
    });
  }
  

  updateCharts() {
    Object.values(this.charts).forEach((chart) => {
      chart.draw()
    })
  }
}
