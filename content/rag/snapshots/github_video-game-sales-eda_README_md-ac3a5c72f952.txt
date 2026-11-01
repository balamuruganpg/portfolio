# 🎮 Video Games Sales Analysis & EDA

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=for-the-badge&logo=python)
![Pandas](https://img.shields.io/badge/Pandas-2.0-green?style=for-the-badge&logo=pandas)
![Seaborn](https://img.shields.io/badge/Seaborn-Data%20Viz-blueviolet?style=for-the-badge)
![Machine Learning](https://img.shields.io/badge/AI%2FML-Technical%20Training-ff69b4?style=for-the-badge)

Welcome to my **Exploratory Data Analysis (EDA) of Video Games Sales** repository! 🚀 
This project is part of my continuous journey in **AI & Machine Learning Technical Training**. Mastering data exploration is the crucial first step before building predictive ML models, and this project dives deep into understanding the global video game market from 1980 to 2024.

---

## 🧠 Why This Project? (AI/ML Context)
In Machine Learning, **data is everything**. Before feeding data into algorithms, we must understand its distribution, handle anomalies, and uncover hidden patterns. This project demonstrates my ability to:
- **Clean & Preprocess Data**: Getting data ready for ML models.
- **Uncover Correlations**: Identifying features that drive sales (essential for feature selection).
- **Visualize Complex Data**: Using advanced plotting techniques to tell a story with data.

---

## 📊 Key Insights & Visualizations

During my analysis, I utilized `seaborn` and `matplotlib` to extract meaningful insights from the dataset. Below are some of the key visualizations generated in the notebook.

### 1. Market Distribution by Genre
Understanding the class distribution is vital for any ML classification task. Here we look at how games are distributed across genres.
<p align="center">
  <img src="images/plot_1.png" alt="Number of Video Games by Genres" width="45%">
  <img src="images/plot_3.png" alt="Distribution of Video Game Genres" width="45%">
</p>

### 2. Critic Scores Analysis
Does critical acclaim translate to higher sales? The distribution of critic scores helps us understand the spread of game ratings.
<p align="center">
  <img src="images/plot_2.png" alt="Distribution of Critic Scores" width="45%">
  <img src="images/plot_8.png" alt="KDE of Critic Scores" width="45%">
</p>

### 3. Feature Correlation (Crucial for ML)
A correlation heatmap helps in feature selection by identifying highly correlated variables.
<p align="center">
  <img src="images/plot_6.png" alt="Correlation Heatmap" width="70%">
</p>

### 4. Advanced Distributions
Exploring data spread and outliers using Boxplots, Violin Plots, and Swarm Plots.
<p align="center">
  <img src="images/plot_4.png" alt="Boxplot" width="30%">
  <img src="images/plot_7.png" alt="Violin Plot" width="30%">
  <img src="images/plot_11.png" alt="Swarm Plot" width="30%">
</p>

### 5. Sales vs. Critic Score
Scatter and pairplots to visualize multi-dimensional relationships.
<p align="center">
  <img src="images/plot_5.png" alt="Scatterplot" width="45%">
  <img src="images/plot_10.png" alt="Pairplot" width="45%">
</p>

---

## 🛠️ Tools & Technologies Used
- **Python**: Core programming language.
- **Jupyter Notebook**: Interactive coding and documentation.
- **Pandas & NumPy**: Data manipulation and numerical computations.
- **Matplotlib & Seaborn**: Advanced statistical data visualization.

## 🚀 How to Run
1. Clone this repository.
2. Ensure you have the required libraries installed (`pip install pandas numpy matplotlib seaborn jupyter`).
3. Open `EDA-Video-Games-Sales-Analysis.ipynb` in Jupyter Notebook or JupyterLab.
4. Run the cells to reproduce the analysis.

---
*This repository is a testament to my dedication in mastering the foundations of Data Science as I progress towards advanced Machine Learning and Artificial Intelligence.* 💡
