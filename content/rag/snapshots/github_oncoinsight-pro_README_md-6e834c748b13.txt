<p align="center">
  <img src="images/banner.jpg" alt="OncoInsight Pro Banner" width="100%"/>
</p>

<h1 align="center">🧬 OncoInsight Pro — Cancer Analytics Platform</h1>

<p align="center">
  <b>Advanced Cancer Patient Analytics & Predictive Intelligence Platform</b><br/>
  <i>Built as part of my AI/ML Technical Training journey — exploring Data Science, Statistical Analysis, and Machine Learning in Healthcare</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Streamlit-1.x-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white" alt="Streamlit"/>
  <img src="https://img.shields.io/badge/Scikit--Learn-ML-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-Learn"/>
  <img src="https://img.shields.io/badge/Plotly-Interactive_Charts-3F4F75?style=for-the-badge&logo=plotly&logoColor=white" alt="Plotly"/>
  <img src="https://img.shields.io/badge/Pandas-Data_Analysis-150458?style=for-the-badge&logo=pandas&logoColor=white" alt="Pandas"/>
  <img src="https://img.shields.io/badge/SciPy-Statistics-8CAAE6?style=for-the-badge&logo=scipy&logoColor=white" alt="SciPy"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-06d6a0?style=flat-square" alt="Status"/>
  <img src="https://img.shields.io/badge/License-MIT-818cf8?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/Dataset-17,686_Patients-38bdf8?style=flat-square" alt="Dataset"/>
</p>

---

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [🧠 What I Learned](#-what-i-learned)
- [✨ Key Features](#-key-features)
- [🖼️ Dashboard Preview](#️-dashboard-preview)
- [📊 Exploratory Data Analysis](#-exploratory-data-analysis)
- [🔬 Statistical Analysis](#-statistical-analysis)
- [🤖 Machine Learning Models](#-machine-learning-models)
- [🏗️ Tech Stack & Architecture](#️-tech-stack--architecture)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [📊 Dataset Description](#-dataset-description)
- [🔮 Future Enhancements](#-future-enhancements)
- [🙏 Acknowledgments](#-acknowledgments)

---

## 🎯 Project Overview

**OncoInsight Pro** is a comprehensive cancer patient analytics and predictive intelligence platform I developed as part of my **AI/ML Technical Training**. This project demonstrates my understanding of the complete data science lifecycle — from raw data exploration and statistical hypothesis testing to building production-ready machine learning models, all wrapped in an interactive, premium-grade dashboard.

> **📌 Learning Goal:** To apply core AI/ML concepts — *Exploratory Data Analysis, Statistical Inference, Feature Engineering, Gradient Boosting, and Model Evaluation* — on real-world healthcare data and build an end-to-end analytics platform.

The platform analyzes **17,686 cancer patient records** across **6 cancer types**, providing:
- 📊 **Interactive EDA** with 25+ dynamic visualizations
- 🔬 **6 Statistical Hypothesis Tests** with effect sizes and visual diagnostics
- 🤖 **2 ML Models** — Gradient Boosting Regressor & Classifier
- 🔮 **Live Prediction Engine** for patient outcomes
- 🔍 **Patient Explorer** with multi-filter capabilities
- ⚖️ **Comparative Analysis** with automated statistical testing

---

## 🧠 What I Learned

This project was a deep dive into several critical areas of AI/ML:

| Area | Key Concepts Applied |
|------|---------------------|
| **Data Wrangling** | Pandas DataFrames, missing value imputation, feature encoding, data type handling |
| **Exploratory Data Analysis** | Distribution analysis, violin plots, box plots, histograms, sunburst charts, heatmaps |
| **Statistical Testing** | T-Test, ANOVA, Chi-Square, Mann-Whitney U, Kruskal-Wallis, Pearson Correlation |
| **Effect Size Metrics** | Cohen's d, Eta-squared (η²), Cramér's V, Rank-Biserial r, Epsilon-squared (ε²) |
| **Machine Learning** | Gradient Boosting (Regression & Classification), Cross-Validation, Hyperparameter Tuning |
| **Model Evaluation** | R², RMSE, MAE, Accuracy, Precision, Recall, F1-Score, ROC-AUC, Confusion Matrix |
| **Feature Engineering** | One-Hot Encoding, Feature Importance Analysis, Similarity-based Patient Matching |
| **Data Visualization** | Plotly interactive charts, dark-theme design, glassmorphism UI, responsive layouts |
| **Web App Development** | Streamlit framework, caching strategies, session state management |

---

## ✨ Key Features

### 📊 Overview Dashboard
- **8 KPI Metric Cards** with glassmorphism design showing key statistics at a glance
- Cancer type distribution (interactive donut chart)
- Stage distribution breakdown per cancer type
- Data quality panel with missing values, data types, and numeric summaries
- Paginated patient records explorer

### 📈 Exploratory Data Analysis (7 Tabs)
- **Distributions** — Histograms with marginal box plots, violin plots by cancer type
- **Correlations** — Interactive heatmap + scatter plots with OLS trendlines
- **Cancer Type Analysis** — Survival and tumor size comparisons, grouped mean metrics
- **Demographics** — Age pyramid by gender, BMI distributions, race/ethnicity breakdown
- **Treatment Analysis** — Sunburst charts, treatment effectiveness summary tables
- **Survival Analysis** — Kaplan-Meier style empirical CDF curves, survival heatmaps
- **Geographic Analysis** — Regional patient counts, survival disparities

### 🔬 Statistical Hypothesis Testing
Six rigorous statistical tests with:
- Null hypothesis statements
- Test statistics and p-values
- Effect size calculations
- Visual diagnostic plots
- Clear significance verdicts

### 🤖 Predictive Machine Learning Models
- **Survival Prediction** — Gradient Boosting Regressor (R², RMSE, MAE, 5-Fold CV)
- **Recurrence Prediction** — Gradient Boosting Classifier (Accuracy, Precision, Recall, F1, ROC-AUC)
- Feature importance rankings (Top 15)
- Actual vs. Predicted scatter plots and residual analysis
- Confusion matrix and ROC curve visualizations
- Model export capability (`.pkl` files)

### 🔮 Live Prediction Engine
- Interactive patient profile input form
- Real-time survival months prediction
- Recurrence risk gauge with probability scoring
- 5 most similar patients from the dataset (distance-based matching)

### ⚖️ Comparative Analysis
- Side-by-side group comparison across any categorical variable
- Automated statistical testing (T-test + Mann-Whitney U) across all numeric variables
- Visual comparison with overlaid histograms and violin plots

---

## 🖼️ Dashboard Preview

<p align="center">
  <img src="images/dashboard_preview.jpg" alt="OncoInsight Pro Dashboard" width="90%"/>
</p>

<p align="center"><i>The premium dark-themed dashboard with glassmorphism KPI cards and interactive charts</i></p>

---

## 📊 Exploratory Data Analysis

### Feature Distributions
The notebook includes comprehensive distribution analysis of all numeric features. Below are the distributions for Age, BMI, Tumor Size, and Survival Months across the patient population:

<p align="center">
  <img src="images/eda_distributions.png" alt="Feature Distributions - Age, BMI, TumorSize, SurvivalMonths" width="85%"/>
</p>

<p align="center"><i>Distribution plots with KDE curves for Age, BMI, Tumor Size, and Survival Months — revealing near-uniform distributions across most features</i></p>

### Correlation Analysis
Understanding feature relationships is crucial for model building. The correlation matrix reveals the linear dependencies between numeric variables:

<p align="center">
  <img src="images/correlation_heatmap.png" alt="Correlation Heatmap" width="55%"/>
</p>

<p align="center"><i>Correlation matrix heatmap — very low correlations between features, indicating independent feature contributions to the models</i></p>

---

## 🔬 Statistical Analysis

The platform implements **6 statistical hypothesis tests**, each with proper effect size metrics:

| # | Test | Hypothesis | Effect Size Metric |
|---|------|-----------|-------------------|
| 1 | **Independent T-Test** | Age difference by Gender | Cohen's d |
| 2 | **One-Way ANOVA** | Survival across Cancer Types | Eta-squared (η²) |
| 3 | **Chi-Square Test** | Recurrence vs Treatment Response independence | Cramér's V |
| 4 | **Mann-Whitney U** | Tumor Size by Recurrence status | Rank-Biserial r |
| 5 | **Kruskal-Wallis H** | BMI across Cancer Stages | Epsilon-squared (ε²) |
| 6 | **Pearson Correlation** | Age vs Survival Months | R² (variance explained) |

> Each test includes: **H₀ statement → Test statistic → P-value → Effect size → Visual diagnostic → Significance verdict**

---

## 🤖 Machine Learning Models

### Model 1: Survival Prediction (Regression)
```
Algorithm     : Gradient Boosting Regressor
Estimators    : 200 trees, max_depth=5, lr=0.1
Evaluation    : R², RMSE, MAE, 5-Fold Cross-Validation
Visualization : Actual vs Predicted, Residual Analysis, Feature Importance
```

### Model 2: Recurrence Prediction (Classification)
```
Algorithm     : Gradient Boosting Classifier
Estimators    : 200 trees, max_depth=5, lr=0.1
Evaluation    : Accuracy, Precision, Recall, F1-Score, ROC-AUC
Visualization : Confusion Matrix, ROC Curve, Feature Importance
```

Both models use **13 features** including demographics (Age, Gender, Race/Ethnicity, BMI), clinical data (Cancer Type, Stage, Tumor Size), treatment information, and genetic markers.

---

## 🏗️ Tech Stack & Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   OncoInsight Pro v2.0                      │
├────────────────────────────────────────────────────────────┤
│  Frontend       │  Streamlit + Custom CSS (Glassmorphism)  │
│  Visualization  │  Plotly (Interactive) + Matplotlib/Sns   │
│  ML Framework   │  Scikit-Learn (GBR, GBC, RandomForest)   │
│  Statistics     │  SciPy (T-test, ANOVA, Chi², Mann-Whitney)│
│  Data Engine    │  Pandas + NumPy                          │
│  Model Storage  │  Joblib (.pkl serialization)             │
│  Caching        │  Streamlit @cache_data / @cache_resource │
│  Design         │  Inter Font + Dark Theme + Glassmorphism │
└────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10 or higher
- pip package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/balamuruganpg/OncoInsight-Pro-Cancer-Analytics.git
cd OncoInsight-Pro-Cancer-Analytics

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install streamlit pandas numpy plotly scipy scikit-learn joblib matplotlib seaborn

# Run the dashboard
streamlit run app.py
```

### Quick Start
```bash
# If you just want to run it quickly:
pip install streamlit pandas numpy plotly scipy scikit-learn joblib
streamlit run app.py
```

The application will open at `http://localhost:8501` in your browser.

---

## 📁 Project Structure

```
OncoInsight-Pro-Cancer-Analytics/
│
├── app.py                                          # 🚀 Main Streamlit dashboard (1,418 lines)
├── Cancer_Patients_Dashboard(Statistics).ipynb      # 📓 Jupyter Notebook — EDA & statistical analysis
├── cancer issue.csv                                # 📊 Dataset — 17,686 patient records
├── survival_regression_model.pkl                   # 🤖 Trained survival prediction model
├── survival_model.pkl                              # 🤖 Alternate survival model
├── recurrence_classifier_model.pkl                 # 🤖 Trained recurrence classification model
├── .gitignore                                      # 🚫 Git ignore rules
├── README.md                                       # 📖 Project documentation (this file)
│
└── images/                                         # 🖼️ README images & visualizations
    ├── banner.jpg                                  #     Project banner
    ├── dashboard_preview.jpg                       #     Dashboard screenshot
    ├── eda_distributions.png                       #     Feature distribution plots
    └── correlation_heatmap.png                     #     Correlation matrix heatmap
```

---

## 📊 Dataset Description

| Feature | Type | Description |
|---------|------|-------------|
| `PatientID` | int | Unique patient identifier |
| `Age` | int | Patient age (18–90) |
| `Gender` | str | Male / Female |
| `Race/Ethnicity` | str | Caucasian, African American, Hispanic, Asian, Other |
| `BMI` | float | Body Mass Index (18.5–40.0) |
| `SmokingStatus` | str | Smoker, Non-Smoker, Former Smoker |
| `FamilyHistory` | str | Yes / No |
| `CancerType` | str | Breast, Lung, Colon, Prostate, Skin, Stomach |
| `Stage` | str | I, II, III, IV |
| `TumorSize` | float | Tumor size in cm (1.0–10.0) |
| `TreatmentType` | str | Surgery, Chemotherapy, Radiation, Combination Therapy |
| `TreatmentResponse` | str | Complete Response, Partial Remission, No Response, etc. |
| `SurvivalMonths` | int | Survival duration in months (1–120) |
| `Recurrence` | str | Yes / No |
| `GeneticMarker` | str | BRCA1, EGFR, TP53, KRAS, etc. (24% missing → imputed as "Unknown") |
| `HospitalRegion` | str | East, West, South, Midwest |

---

## 🔮 Future Enhancements

- [ ] Deep Learning models (Neural Networks for survival prediction)
- [ ] Kaplan-Meier survival analysis with `lifelines` library
- [ ] SHAP values for model interpretability
- [ ] Multi-page Streamlit app with authentication
- [ ] RESTful API endpoint for model serving
- [ ] Docker containerization for deployment
- [ ] Additional datasets for cross-validation

---

## 🙏 Acknowledgments

- This project was built as part of my **AI/ML Technical Training** to gain hands-on experience with the full data science pipeline
- Dataset sourced from healthcare simulation data for educational purposes
- Built with love using Python, Streamlit, and the amazing open-source data science ecosystem

---

<p align="center">
  <b>⭐ If you found this project helpful, please consider giving it a star! ⭐</b>
</p>

<p align="center">
  <i>Built with 🧬 by <a href="https://github.com/balamuruganpg">Balamurugan P G</a> — Learning AI/ML, one project at a time</i>
</p>
