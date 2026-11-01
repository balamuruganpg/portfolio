# DBSCAN Clustering for Height & Weight 🧑‍🔬

Welcome to my Machine Learning training project! In this repository, I explore the **DBSCAN** (Density-Based Spatial Clustering of Applications with Noise) algorithm to cluster a dataset of heights and weights. This is part of my hands-on AI/ML technical training to build intuition around unsupervised learning techniques! 🚀

## 🎯 Project Objective
The main goal of this project is to identify natural clusters and potential outliers in a dataset containing individuals' heights and weights. Unlike K-Means, which assumes spherical clusters, DBSCAN excels at finding arbitrarily shaped clusters and is robust to noise (outliers).

## 🛠️ Tools & Technologies
- **Python 3** 🐍
- **Pandas & NumPy** for data manipulation
- **Scikit-Learn** for the DBSCAN algorithm & data scaling
- **Matplotlib & Seaborn** for data visualization

## 📊 Visualizations from the Notebook

Here is a glimpse into the clustering process:

### 1. Data Distribution
The initial distribution of height and weight in the dataset.
![Data Distribution](images/plot_1.png)

### 2. K-Distance Graph (Finding Optimal Epsilon)
To find the optimal `eps` parameter for DBSCAN, we use the K-distance graph. The "elbow" point indicates a good `eps` value.
![K-Distance Graph](images/plot_2.png)

### 3. DBSCAN Clustering Results
The final clusters formed by DBSCAN. Notice how it groups the dense regions and labels the sparse points as noise/outliers.
![DBSCAN Clustering Results](images/plot_3.png)

## 💡 Key Learnings
- **Scaling is Crucial:** Density-based algorithms are highly sensitive to the scale of the features. Using `StandardScaler` was a vital preprocessing step.
- **Tuning `eps` and `min_samples`:** The success of DBSCAN heavily relies on finding the right epsilon and minimum samples. The Nearest Neighbors approach is a great way to estimate epsilon programmatically.
- **Outlier Detection:** One of the best features of DBSCAN is that it doesn't force every point into a cluster, allowing us to easily spot anomalies.

## 🚀 How to Run
1. Clone this repository.
2. Install the required libraries: `pip install pandas numpy scikit-learn matplotlib seaborn`
3. Open and run the Jupyter Notebook: `jupyter notebook DBSCAN-Height-Weight-Clustering.ipynb`

---
*Always learning, always coding! If you find this interesting, feel free to connect or drop a star! ⭐*
