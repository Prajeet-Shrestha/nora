from flask import Flask, jsonify
import pymongo
app = Flask(__name__)

@app.route('/')
def connect_to_db():
    client = pymongo.MongoClient("mongodb+srv://Saahil:Tuzza13A@clusternora.7kdfr.mongodb.net/NoraDB?retryWrites=true&w=majority")
    db = client.test
    return jsonify({"connected": True, "message": "connected to database"})

if __name__ == '__main__':
    app.run(debug=True)
