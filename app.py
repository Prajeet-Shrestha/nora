from flask import Flask, request, jsonify
from flask_restful import Api, Resource
from flask_cors import CORS, cross_origin
import re
import pymongo
import datetime
import random
import json
import pickle
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
from tensorflow.keras.models import load_model


app = Flask(__name__)
api = Api(app)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


class Chat(Resource):
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.intents = json.loads(open('static/intents.json').read())
        self.words = pickle.load(open('static/words.pkl', 'rb'))
        self.classes = pickle.load(open('static/classes.pkl', 'rb'))
        self.model = load_model('static/nora_model.h5')

    def clean_up_sentence(self, sentence):
        sentence_words = nltk.word_tokenize(sentence)
        sentence_words = [self.lemmatizer.lemmatize(word) for word in sentence_words]
        return sentence_words

    def bag_of_words(self, sentence):
        sentence_words = self.clean_up_sentence(sentence)
        bag = [0] * len(self.words)
        for w in sentence_words:
            for i, word in enumerate(self.words):
                if word == w:
                    bag[i] = 1
        return np.array(bag)

    def predict_class(self, sentence):
        bow = self.bag_of_words(sentence)
        res = self.model.predict(np.array([bow]))[0]
        ERROR_THRESHOLD = 0.25
        results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
        results.sort(key=lambda x: x[1], reverse=True)
        return_list = []
        for r in results:
            return_list.append({'intent': self.classes[r[0]], 'probability': str(r[1])})
        return return_list

    def get_response(self, intents_list, intents_json):
        tag = intents_list[0]['intent']
        list_of_intents = intents_json['intents']
        for i in list_of_intents:
            if i['tag'] == tag:
                result = [i['tag'], random.choice(i['responses'])]
                break
        return result

    def post(self):
        content = request.json
        message = content['message']
        ints = self.predict_class(message)
        res = self.get_response(ints, self.intents)
        return jsonify({
            'status': 'success',
            'data': {'intent': res[0], 'response': res[1]}
            })


class Authenticate(Resource):
    def __init__(self):
        self.client = pymongo.MongoClient("mongodb+srv://Saahil:FXOVdWdoxMtSKp1f@cluster0.flbld.mongodb.net/noradb?retryWrites=true&w=majority")
        self.db = self.client.noradb

    def post(self):
        try:
            content = request.json
            assert re.match("^[0-9]{10}$", content['phoneno'])
            result = self.db.users.find_one({
                "phoneno": content['phoneno'],
                "otp": content['otp']
            })
            if result:
                return jsonify({
                'status': 'success',
                'data': {
                    'task': 'authenticate',
                    'message': 'User is authenticated'
                    }
                })
            else:
                return jsonify({
                'status': 'failure',
                'data': {
                    'task': 'authenticate',
                    'message': 'User is not authenticated'
                    }
                })
        except AssertionError:
            return jsonify({
                'status': 'failure',
                'data': {
                    'task': 'authenticate',
                    'message': 'Invalid data'
                }
            })
        except:
            return jsonify({
                'status': 'failure',
                'data': {
                    'task': 'authenticate',
                    'message': 'Network error'
                    }
                })


class AddWithdraw(Resource):
    def __init__(self):
        self.client = pymongo.MongoClient("mongodb+srv://Saahil:FXOVdWdoxMtSKp1f@cluster0.flbld.mongodb.net/noradb?retryWrites=true&w=majority")
        self.db = self.client.noradb

    def post(self):
        try:
            content = request.json
            assert re.match("^[0-9]{10}$", content['phoneno'])
            assert isinstance(content['amount'], float)
            assert len(content['purpose']) > 0 and not content['purpose'].isspace()
            self.db.withdraws.insert_one({
                        "phoneno": content['phoneno'],
                        "amount": float(content['amount']),
                        "date": datetime.datetime.now(),
                        "purpose": content['purpose']
                    })
            self.db.users.update_one(
                {"phoneno": content['phoneno']},
                {"$inc": {"balance": -1 * content['amount']}}
            )
            return jsonify({
                'status': 'success',
                'data': {
                    'task': 'add_withdraw',
                    'message': 'Data inserted to database'
                }
            })
        except AssertionError:
            return jsonify({
                'status': 'failure',
                'data': {
                    'task': 'add_withdraw',
                    'message': 'Invalid data'
                }
            })
        except Exception:
            return jsonify({
                'status': 'failure',
                'data': {
                    'task': 'add_withdraw',
                    'message': 'Network error'
                }
            })


class AddDeposit(Resource):
    def __init__(self):
        self.client = pymongo.MongoClient("mongodb+srv://Saahil:FXOVdWdoxMtSKp1f@cluster0.flbld.mongodb.net/noradb?retryWrites=true&w=majority")
        self.db = self.client.noradb

    def post(self):
        try:
            content = request.json
            assert re.match("^[0-9]{10}$", content['phoneno'])
            assert isinstance(content['amount'], float)
            assert len(content['purpose']) > 0 and not content['purpose'].isspace()
            self.db.deposits.insert_one({
                        "phoneno": content['phoneno'],
                        "amount": float(content['amount']),
                        "date": datetime.datetime.now(),
                        "purpose": content['purpose']
                    })
            self.db.users.update_one(
                {"phoneno": content['phoneno']},
                {"$inc": {"balance": content['amount']}}
            )
            return jsonify({
                'status': 'success',
                'data': {
                    'task': 'add_deposit',
                    'message': 'Data inserted to database'
                }
            })
        except AssertionError:
            return jsonify({
                'status': 'failure',
                'data': {
                    'task': 'add_deposit',
                    'message': 'Invalid data'
                }
            })
        except Exception:
            return jsonify({
                'status': 'failure',
                'data': {
                    'task': 'add_deposit',
                    'message': 'Network error'
                }
            })


class CheckBalance(Resource):
    def __init__(self):
        self.client = pymongo.MongoClient("mongodb+srv://Saahil:FXOVdWdoxMtSKp1f@cluster0.flbld.mongodb.net/noradb?retryWrites=true&w=majority")
        self.db = self.client.noradb

    def post(self):
        try:
            content = request.json
            assert re.match("^[0-9]{10}$", content['phoneno'])
            result = self.db.users.find_one({
                "phoneno": content['phoneno']
            })
            return jsonify({
                'status': 'success',
                "data": {
                    'task': 'check_balance',
                    'balance': result['balance'],
                    'message': 'Balance retreived'
                }
            })
        except AssertionError:
            return jsonify({
                'status': 'failure',
                'data': {
                    'task': 'check_balance',
                    'balance': None,
                    'message': 'Invalid data'
                }
            })
        except:
            return jsonify({
                'status': 'failure',
                'data': {
                    'task': 'add_deposit',
                    'balance': None,
                    'message': 'Network error'
                }
            })
   
api.add_resource(Chat, "/chat")
api.add_resource(Authenticate, "/authenticate")
api.add_resource(AddWithdraw, "/add_withdraw")
api.add_resource(AddDeposit, "/add_deposit")
api.add_resource(CheckBalance, "/check_balance")


if __name__ == '__main__':
    app.run(debug=True)
