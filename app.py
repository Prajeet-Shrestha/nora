from flask import Flask, request, jsonify
from flask_restful import Api, Resource
import pymongo
import datetime

app = Flask(__name__)
api = Api(app)


class Reply(Resource):
    def __init__(self):
        self.intent_hash = {
            "deposit": self.deposit_money,
            "withdraw": self.withdraw_money,
            "showdeposit": self.show_deposits_records,
            "showwithdraw": self.show_withdraws_records,
            "login": self.authenticate
        }
        self.client = pymongo.MongoClient("mongodb+srv://Saahil:FXOVdWdoxMtSKp1f@cluster0.flbld.mongodb.net/noradb?retryWrites=true&w=majority")
        self.db = self.client.noradb

    def deposit_money(self, phoneno, query):
        if "for" not in query:
            purpose = ""
        else:
            for_index = query.index("for")
            purpose = " ".join(query[for_index+1:])
        for word in query:
            if word.isnumeric():
                self.db.deposits.insert_one({
                    "phoneno": phoneno,
                    "amount": float(word),
                    "date": datetime.datetime.now(),
                    "purpose": purpose
                })
                return jsonify({"intent": "deposit_money", "status": True, "message": "Deposit data has been inserted to database"})
        return jsonify({"intent": "deposit_money", "status": False, "message": "Please specify the amount you deposited"})

    def withdraw_money(self, phoneno, query):
        if "for" not in query:
            purpose = ""
        else:
            for_index = query.index("for")
            purpose = " ".join(query[for_index+1:])
        for word in query:
            if word.isnumeric():
                self.db.withdraws.insert_one({
                    "phoneno": phoneno,
                    "amount": float(word),
                    "date": datetime.datetime.now(),
                    "purpose": purpose
                })
                return jsonify({"intent": "withdraw_money", "status": True, "message": "Withdraw data has been inserted to database"})
        return jsonify({"intent": "withdraw_money", "status": False, "message": "Please specify the amount you withdrew"})

    def show_deposits_records(self, phoneno, query):
        pass

    def show_withdraws_records(self, phoneno, query):
        pass

    def authenticate(self, phoneno, query):
        token = {
            "phoneno": query[query.index('phoneno')+1],
            "password": query[query.index('password')+1]
        }
        if self.db.users.find_one(token):
            return jsonify({"intent": "authenticate", "status": True, "message": "Welcome back !!"})
        return jsonify({"intent": "authenticate", "status": False, "message": "Sorry, I don't recognize you. Would you like to sign up?"})


    def post(self):
        content = request.json
        query = list(map(str, content['message'].split()))
        for word in query:
            if word in self.intent_hash.keys():
                return self.intent_hash[word](content['phoneno'], query)
        return jsonify({"intent": "undetermined", "status": False, "message": "Sorry, I couldn't understand you"})

api.add_resource(Reply, "/reply")


if __name__ == '__main__':
    app.run(debug=True)
