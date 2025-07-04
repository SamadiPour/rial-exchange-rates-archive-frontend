# Rial Exchange Rates Archive

A modern, interactive web application for visualizing Iranian Rial exchange rates against various international
currencies. Built with Vue 3, TypeScript, and Chart.js, featuring data export capabilities.

![Website Screenshot](https://github.com/user-attachments/assets/85d56763-2e8f-4ab4-a68e-40096dbbba0c)

## ✨ Features

### 📊 Data Visualization

- **ROI Mode**: Calculate and display return on investment percentages
- **Multi-Currency Support**: Compare multiple currencies simultaneously
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Data Export**: Export exchange rate data as CSV, JSON or XML files
- **Chart Export**: Save charts as PNG, SVG, or PDF

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SamadiPour/rial-exchange-rates-archive-frontend.git
   cd rial-exchange-rates-archive-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🛠 Tech Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with vue-chartjs
- **Linting**: ESLint + Prettier
- **Router**: Vue Router 4

## 🔗 Data Source

This application uses exchange rate data from
the [Rial Exchange Rates Archive](https://github.com/SamadiPour/rial-exchange-rates-archive) repository, which provides
historical Iranian Rial exchange rates in a structured JSON format.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to
discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
