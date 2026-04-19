# Rial Exchange Rates Archive

A modern, interactive web application for visualizing Iranian Rial exchange rates against various international
currencies. Built with Vue 3 and TypeScript, featuring data export capabilities.

![Website Screenshot]()

## ✨ Features

### 📊 Data Visualization

- **Multi-Currency Support**: Compare multiple currencies simultaneously
- **ROI Mode**: Calculate and display return on investment percentages
- **Data & Chart Export**: Ability to export data and charts in various formats
- **Dark/Light Theme**: Toggle between themes with system preference detection

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.0+

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/SamadiPour/rial-exchange-rates-archive-frontend.git
   cd rial-exchange-rates-archive-frontend
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Start the development server**

   ```bash
   bun run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

### Building for Production

```bash
bun run build
```

The build artifacts will be stored in the `dist/` directory.

## 🛠 Tech Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Custom CSS with CSS variables
- **Charts**: Canvas-based custom chart implementation
- **Linting**: ESLint + Prettier

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
