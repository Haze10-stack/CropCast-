import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import make_pipeline
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

def load_and_prepare_data(file_path):
    data = pd.read_csv(file_path)
    le = LabelEncoder()
    data['label_encoded'] = le.fit_transform(data['label'])
    X = data.drop(['label', 'label_encoded'], axis=1)
    y = data['label_encoded']
    
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    return X_scaled, y, le.classes_

def evaluate_classifier(clf, X, y, name):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, 
                                                               average='weighted', 
                                                               zero_division=0)
    cv_scores = cross_val_score(clf, X, y, cv=5)
    
    return {
        'Classifier': name,
        'Accuracy': accuracy,
        'Cross-Validation Mean': cv_scores.mean(),
        'Cross-Validation Std': cv_scores.std(),
        'Precision': precision,
        'Recall': recall,
        'F1 Score': f1
    }

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    X, y, classes = load_and_prepare_data("Crop_recommendation1.csv")
    
    # Define individual classifiers
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42
    )
    gb = GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=5,
        random_state=42
    )
    ab = AdaBoostClassifier(
        n_estimators=200,
        algorithm='SAMME',
        random_state=42
    )
    lr = OneVsRestClassifier(LogisticRegression(
        max_iter=5000,
        solver='saga',
        random_state=42
    ))
    svm = make_pipeline(
        StandardScaler(), 
        SVC(
            kernel='rbf',
            C=1.0,
            gamma='scale',
            random_state=42,
            probability=True  #voting
        )
    )
    
    
    ensemble = VotingClassifier(
        estimators=[
            ('Random Forest', rf),
            ('Gradient Boosting', gb),
            ('AdaBoost', ab),
            ('Logistic Regression', lr),
            ('SVM', svm)
        ],
        voting='soft'  
    )
    
   
    classifiers = [
        ('Random Forest', rf),
        ('Gradient Boosting', gb),
        ('AdaBoost', ab),
        ('Logistic Regression', lr),
        ('SVM', svm),
        ('Ensemble', ensemble)  
    ]
    
    
    results = []
    for name, clf in classifiers:
        results.append(evaluate_classifier(clf, X, y, name))
    
    
    results_df = pd.DataFrame(results)
    output_file = os.path.join(script_dir, 'optimized_model_performance_metrics.xlsx')
    results_df.to_excel(output_file, index=False)
    
    print(f"Optimized performance metrics saved to: {output_file}")
    print("\nDetailed Results:")
    print(results_df.to_string(index=False))

if __name__ == "__main__":
    main()