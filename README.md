# 🌱 CropCast:Cultivating Success Through Data-Driven Recommendations

## Quick Start

1. Install dependencies:
   ```
   pip install pandas numpy scikit-learn
   ```

2. Place `Crop_recommendation1.csv` in the project directory

3. Run:
   ```
   python crop_recommendation_model.py
   ```

## Features

- Evaluates 6 classifiers: Random Forest, Gradient Boosting, AdaBoost, Logistic Regression, SVM, and Ensemble
- Auto-generates performance metrics (accuracy, precision, recall, F1)
- Includes cross-validation for robust evaluation
- Exports results to Excel for easy comparison

## Dataset Format

The CSV must include soil/climate feature columns and a `label` column containing crop names.

## Output

- Excel file: `optimized_model_performance_metrics.xlsx`
- Console display of all metrics

## Tech Stack

Python, pandas, numpy, scikit-learn
