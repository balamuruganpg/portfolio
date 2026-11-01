# Hierarchical Clustering on Height & Weight Data 🚀

Welcome to my AI/ML Technical Training journey! This repository showcases a practical implementation of **Hierarchical Clustering** applied to a dataset containing height and weight measurements.

As part of my ongoing learning in Artificial Intelligence and Machine Learning, I am exploring unsupervised learning algorithms to discover hidden patterns and structures in data.

## 🎯 Project Overview

In this project, I utilized **Agglomerative Hierarchical Clustering** to group individuals based on their height and weight. The goal is to identify distinct clusters without any prior labels, demonstrating how machine learning can automatically find natural groupings in numerical data.

### Key Concepts Explored:
- **Data Preprocessing & Scaling**: Ensuring features contribute equally using `StandardScaler`.
- **Dendrograms**: Visualizing the hierarchical relationship between data points to determine the optimal number of clusters.
- **Agglomerative Clustering**: Applying the bottom-up clustering approach using `scikit-learn`.
- **Data Visualization**: Creating insightful plots with `matplotlib` and `seaborn`.

## 🛠️ Technologies Used
- **Python 3**
- **Pandas** & **NumPy** for Data Manipulation
- **Scikit-Learn** for Machine Learning
- **SciPy** for Hierarchical Clustering algorithms
- **Matplotlib** & **Seaborn** for Data Visualization
- **Jupyter Notebook** for interactive development

## 📊 Visualizations

Here are some of the key visualizations generated during the analysis:

### 1. Initial Data Distribution
*(Visualizing the raw height and weight data points before clustering)*

![Data Distribution](images/plot_0.png)

### 2. Dendrogram Analysis
*(A dendrogram to understand the hierarchical clustering process and find the optimal number of clusters)*

![Dendrogram](images/plot_1.png)

### 3. Final Clustered Results
*(The dataset after applying Agglomerative Clustering, showing the distinct groups)*

![Clustered Data](images/plot_2.png)

## 🚀 How to Run

1. Clone this repository.
2. Install the required dependencies:
   ```bash
   pip install pandas numpy scikit-learn scipy matplotlib seaborn jupyter
   ```
3. Open the Jupyter Notebook:
   ```bash
   jupyter notebook Hierarchical-Clustering-Height-Weight.ipynb
   ```

---
*This project is part of my continuous journey to master AI and Machine Learning. Feedback and suggestions are always welcome!*
