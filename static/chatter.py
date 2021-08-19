import random
import json
import pickle
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
import tensorflow as tf


lemmatizer = WordNetLemmatizer()
# intents = json.loads(open('/home/saugat/miniproject/backend/nora/static/intents.json').read())
intents = json.loads(open('/home/toothlexx/Github_linked_projects/Mini-Projects/nora-backend/nora/static/intents.json').read())


words = []
classes = []
documents = []
ignore_letters = ['?', '!', '.', ',', ':', ';', '"', "'",]

for intent in intents['intents']:
    for pattern in intent['patterns']:
        word_list = nltk.word_tokenize(pattern)
        words.extend(word_list)
        documents.append((word_list, intent['tag']))
        if intent['tag'] not in classes:
            classes.append(intent['tag'])


words = [lemmatizer.lemmatize(word) for word in words if word not in ignore_letters]
words = sorted(set(words))
classes = sorted(set(classes))

# pickle.dump(words, open('/home/saugat/miniproject/backend/nora/static/words.pkl', 'wb'))
# pickle.dump(classes, open('/home/saugat/miniproject/backend/nora/static/classes.pkl', 'wb'))

pickle.dump(words, open('/home/toothlexx/Github_linked_projects/Mini-Projects/nora-backend/nora/static/words.pkl', 'wb'))
pickle.dump(classes, open('/home/toothlexx/Github_linked_projects/Mini-Projects/nora-backend/nora/static/classes.pkl', 'wb'))


training = []
output_empty = [0] * len(classes)

for document in documents:
    bag = []
    word_patterns = document[0]
    word_patterns = [lemmatizer.lemmatize(word.lower()) for word in word_patterns]
    for word in words:
        bag.append(1) if word in word_patterns else bag.append(0)

    output_row = list(output_empty)
    output_row[classes.index(document[1])] = 1
    training.append([bag, output_row])

random.shuffle(training)
training = np.array(training)

train_x = list(training[:, 0])
train_y = list(training[:, 1])


model = tf.keras.Sequential()
model.add(tf.keras.layers.Dense(256, input_shape=(len(train_x[0]),)))
model.add(tf.keras.layers.Dropout(0.2))
model.add(tf.keras.layers.Dense(128, activation='relu'))
model.add(tf.keras.layers.Dropout(0.2))
model.add(tf.keras.layers.Dense(len(train_y[0]), activation='softmax'))

adam = tf.keras.optimizers.Adam(lr=0.0001)
model.compile(loss='categorical_crossentropy', optimizer=adam, metrics=['accuracy'])

hist = model.fit(np.array(train_x), np.array(train_y), epochs=200, batch_size=4, verbose=1)
# model.save('/home/saugat/miniproject/backend/nora/static/nora_model.h5', hist)
#hist = model.fit(np.array(train_x), np.array(train_y), epochs=100, batch_size=4, verbose=1)
model.save('/home/toothlexx/Github_linked_projects/Mini-Projects/nora-backend/nora/static/nora_model.h5', hist)
