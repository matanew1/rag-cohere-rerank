# Machine Learning Fundamentals

## Definition

Machine learning (ML) is a subfield of artificial intelligence that enables systems to learn from data and improve their performance on tasks without being explicitly programmed. Instead of writing rules by hand, ML practitioners collect labelled (or unlabelled) data, choose a model class, and train the model to discover patterns automatically.

## Supervised Learning

In supervised learning, each training example consists of an input and a corresponding ground-truth label. The model is trained to minimise the discrepancy between its predictions and the true labels, measured by a loss function.

**Classification** maps inputs to discrete categories. Examples include email spam detection, image recognition, and sentiment analysis. Common algorithms include logistic regression, decision trees, random forests, support vector machines (SVMs), and neural networks.

**Regression** maps inputs to continuous values. Examples include house price prediction and weather forecasting. Linear regression, ridge regression, and gradient-boosted trees are popular choices.

## Unsupervised Learning

Unsupervised learning finds structure in data without labelled examples.

**Clustering** groups similar data points together. K-means, DBSCAN, and hierarchical clustering are widely used. A common application is customer segmentation.

**Dimensionality reduction** compresses data into fewer dimensions while preserving structure. Principal Component Analysis (PCA) finds orthogonal directions of maximum variance. t-SNE and UMAP are non-linear methods popular for visualizing high-dimensional data.

**Generative models** learn the underlying data distribution and can sample new examples. Variational autoencoders (VAEs) and generative adversarial networks (GANs) are prominent examples.

## Self-Supervised Learning

Self-supervised learning generates supervision signals from the data itself. In NLP, masked language modeling (as in BERT) asks the model to predict randomly masked tokens. In vision, SimCLR and BYOL learn representations by predicting alternative augmented views of an image. Large language models such as GPT are trained with next-token prediction, a form of self-supervision. This approach allows training on massive unlabelled corpora.

## The Bias-Variance Tradeoff

Every ML model makes a tradeoff between bias (underfitting) and variance (overfitting).

High bias: the model is too simple to capture the true patterns in the data. Training and test error are both high. Addressed by using a more expressive model or more features.

High variance: the model fits the training data too closely and does not generalise. Training error is low but test error is high. Addressed with regularisation, more data, or a simpler model.

Cross-validation is the standard technique for estimating test error without touching the test set. In k-fold cross-validation, the training data is split into k folds; the model is trained k times, each time using k-1 folds for training and the remaining fold for validation.

## Feature Engineering

Feature engineering is the process of transforming raw data into informative inputs for an ML model. It includes normalisation (scaling features to zero mean and unit variance), one-hot encoding of categorical variables, handling missing values, creating interaction features, and applying domain knowledge.

With deep learning, many feature engineering steps are replaced by learned representations. However, for tabular data with modest dataset sizes, hand-crafted features and gradient-boosted trees (such as XGBoost and LightGBM) often outperform neural networks.

## Fine-Tuning Pre-trained Models

Transfer learning leverages models pre-trained on large datasets for related downstream tasks. Fine-tuning starts from a pre-trained checkpoint and continues training on a smaller, task-specific dataset. This dramatically reduces data requirements and training time.

In NLP, large language models (LLMs) like GPT and BERT are fine-tuned for tasks such as question answering, summarisation, and classification. Parameter-efficient fine-tuning techniques such as LoRA (Low-Rank Adaptation) and prefix tuning update only a small fraction of the model's weights, reducing memory and compute costs.

## Model Evaluation

Choosing the right evaluation metric is critical. Accuracy is suitable for balanced classification problems. Precision, recall, and F1-score are better for imbalanced classes. ROC-AUC measures discrimination across all thresholds. For regression, mean absolute error (MAE) and root mean squared error (RMSE) are standard.

Evaluation must always be performed on a held-out test set that was not used for training or hyperparameter selection. Data leakage—where future information inadvertently enters the training set—is a common and serious pitfall.
