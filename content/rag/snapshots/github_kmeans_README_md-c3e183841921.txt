<div align="center">
  
# 🤖 K-Means Clustering: Height & Weight Analysis
### *AIML Technical Training Journey* 🚀

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![NumPy](https://img.shields.io/badge/Numpy-777BB4?style=for-the-badge&logo=numpy&logoColor=white)](https://numpy.org/)
[![Matplotlib](https://img.shields.io/badge/Matplotlib-ffffff?style=for-the-badge&logo=matplotlib&logoColor=black)](https://matplotlib.org/)

*An exploratory project implementing K-Means clustering to discover patterns in human biometric data, developed as part of my continuous learning in Artificial Intelligence and Machine Learning.*

</div>

---

## 🌟 Overview

Welcome to my AIML training repository! This project focuses on **Unsupervised Machine Learning**, specifically utilizing the **K-Means Clustering** algorithm. The goal is to identify distinct groups based on a dataset of human heights and weights, demonstrating how machine learning can automatically discover hidden structures in unlabeled data.

## 📊 Dataset

The dataset used in this project (`Clustering_gmm (2).csv`) contains biometrics measurements:
- **Weight**: Measured in kilograms (kg).
- **Height**: Measured in centimeters/inches.

## 🚀 Key Learning Objectives
As part of my AIML technical training, this project tackles:
1. **Data Preprocessing**: Handling missing values, checking for duplicates, and feature scaling using `StandardScaler`.
2. **Exploratory Data Analysis (EDA)**: Visualizing raw data distribution using `seaborn` and `matplotlib`.
3. **Model Building**: Implementing the K-Means clustering algorithm from `sklearn`.
4. **Model Evaluation**: Determining the optimal number of clusters ($K$) using the **Elbow Method** and **Silhouette Score**.
5. **Visualization**: Graphing the final clustered data points along with their respective centroids.

---

## 📈 Visualizing the Process

### 1. Original Data Distribution
Before feeding the data into our model, it's crucial to understand its shape. The scatter plot below shows the unclustered data points.
![Original Data Distribution](assets/output_image_0.png)

### 2. Finding the Optimal $K$ (Elbow / Silhouette)
To find the right number of clusters, we evaluate the inertia and silhouette scores across different values of $K$.
![Optimal K Selection](assets/output_image_1.png)

### 3. Final K-Means Clusters
After determining the optimal $K$, the model groups the data points into distinct clusters. The centroids (center of each cluster) are marked clearly.
![Clustered Data](assets/output_image_2.png)

---

## 💻 Tech Stack & Libraries
- **Language**: `Python`
- **Data Manipulation**: `pandas`, `numpy`
- **Data Visualization**: `matplotlib`, `seaborn`
- **Machine Learning**: `scikit-learn`

## ⚙️ How to Run
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/KMeans-Height-Weight-Clustering.git
   ```
2. Navigate to the directory:
   ```bash
   cd KMeans-Height-Weight-Clustering
   ```
3. Launch Jupyter Notebook:
   ```bash
   jupyter notebook KMeans-Height-Weight-Clustering.ipynb
   ```

---

<div align="center">
  <i>"Learning AI, one cluster at a time."</i> 🧠💡
</div>
