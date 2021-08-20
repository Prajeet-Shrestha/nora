# Nora: The Banking Chatbot

## Introduction
The Chatbot “Nora” is developed as a mini project on Artificial Intelligence (COMP 472). In
order to solve the banking problem people face in their day to day life, the chatbot is created so
that people deal with their banking problems easily. It is a web based application intended to run
on the desktop environment which lets the user interact with the computer as a form of chat. It
will be using a model that gets trained with the user's banking data using Natural Language
Processing

## Background and Problem Statement
Banking has become a part of everyone’s life. Almost everyone uses the banking sector to
perform their tasks. Now the use of mobile and internet banking facilities has reached greater
heights. Chatbots are becoming trending today. They are computer programs that interact with
users using natural languages. For any banking related queries we have to go to the bank or call
customer care or search Google, which takes a lot of time and effort. On the other hand we don’t
get complete information from the customer care executives. It will be more suitable if we can
directly post our queries online or chat with the bank people and get the response within less
time.

The objective of this project is to contribute to the solution of the problem of direct and indirect
communication between users and Banking Institutions.To ensure easier banking process
through use of user interface. To minimize the time consumption between the customer and the
product and to provide 24*7 accesses to the bank and Banking Applications.

## Running the project on local/virtual linux environment
Since the project is open source, This section is for those interested readers/contributors who
want to experience the project at a deep level and contribute to it if interested.The database system is managed by
the original contributors, however, any user can perform CRUD operation with the access key in
the project backend folder.
The project is created in a way that it can be hosted on any virtual machine/server.
Similarly, to summarize the version and packages used in the project, linux x64

Angular CLI : v10.0.8
Node : v10.19.0
Angular : Ivy Workspace:
Python : v3.8
Flask : latest version
Flask_restful : latest version
Flask-cors : latest version
pymongo[tls, srv] : latest version
nltk : latest version
Tensorflow : latest version

The project is in the github public repository which can be accessed by any users. If you haven’t
installed git in your local system you can do so by using the following command. Be sure to
update your system before installing git.

sudo apt update
sudo apt install git

Once you have installed git, you can clone the project repository using

git clone https://github.com/Prajeet-Shrestha/nora.git


Similarly, the git has two branches, 1. Frontend & 2. Backend. You can clone the repo again to
use both simultaneously using the git checkout command to switch between the branches. Once
again, There needs to be two folders that should have frontend and backend code
respectively.

### 1.1. Installing Dependencies
The project only has a few dependencies that need to be uploaded before working on Nora. Each
dependency has played necessary roles in ensuring the project is optimal and running smoothly .

#### 1.1.1. Frontend dependencies
Since the frontend architecture is based on Angular, You would require Node js and npm. Which
can be installed using,

sudo apt install -y nodejs
sudo npm install -g @angular/cli@10.0.8

Once the packages are installed, you can get inside the frontend project directory and execute the
command to install the package dependencies automatically.

npm install

Once the system install the dependencies, you can locally host the front end application using,

ng serve --open

The application will be hosted in your local server port 4200 ( http://localhost:4200/ ) However,
you would need to start the backend system before fully using the Nora application.

#### 1.1.2. Backend dependencies
The backend system as discussed is based on python3.8. Typically, python3.8 is pre-installed in
your distribution, however in either case you can install python using the command.

sudo apt install -y python3.8

The flask framework typically works in a virtual python environment, you can install the and
setup using the following command. Please make sure that you are in your backend directory
before executing the commands.

sudo apt-get -y install python3-pip
pip3 install virtualenv
sudo apt -y install python3.8-venv

Similarly, to activate the virtual environment upon where you would install the dependencies,

python3 -m venv noraenv
source noraenv/bin/activate
pip3 install -r requirements.txt

Once the requirements are installed, you can execute the command to import the requirement
into the virtual environment and start the application.

echo -e "import nltk\nnltk.download('punkt')\nnltk.download('wordnet')" | python3

Start the project by running the app.py file while your virtual environment is activated.

python3 app.py

