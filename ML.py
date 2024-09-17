from flask import Flask, request, jsonify
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import pandas as pd

def res(x, y):
    total = 0
    for i in x:
        for j in i:
            total += j
    total += y
    if total >= 95:
        return "A+"
    elif total >= 90:
        return "A"
    elif total >= 85:
        return "A-"
    elif total >= 80:
        return "B+"
    elif total >= 75:
        return "B"
    elif total >= 70:
        return "B-"
    elif total >= 65:
        return "C+"
    elif total >= 60:
        return "C"
    elif total >= 55:
        return "C-"
    elif total >= 50:
        return "D"
    else:
        return "F"

df = pd.read_csv('student_grades.csv')
X = df[['7th_week', '12th_week', 'Classwork', 'Cumulative_GPA']]
y = df['Final']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = LinearRegression()
model.fit(X_train, y_train)

app = Flask(__name__)

# Endpoint to handle prediction request
@app.route('/mldata', methods=['POST'])
def mlpredict():
    data = request.get_json()
    student = data.get('st', {})
    print(f'Received data: {student}')  # Debug print to verify data reception

    # Convert values to appropriate types
    exam_7th = float(student.get('exam_7th', 0))
    exam_12th = float(student.get('exam_12th', 0))
    classwork = float(student.get('classwork', 0))
    c_gpa = float(student.get('C_GPA', 0))

    X_input = [[exam_7th, exam_12th, classwork, c_gpa]]
    
    y_pred = model.predict(X_input)
    print(X_input)
    
    total = res(X_input, y_pred[0])
    print(total)
    print(f'Prediction: {total}')  # Debug print to verify prediction
    return jsonify(total)

# Run the Flask application
if __name__ == '__main__':
    app.run(port=4000, debug=True)
