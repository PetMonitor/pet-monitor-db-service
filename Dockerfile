FROM node:16

#Create application directory
WORKDIR /usr/src/app

RUN mkdir logs
RUN touch logs/app.log

COPY entrypoint.sh /usr/src/app

RUN chmod +x /usr/src/app/entrypoint.sh

# Install libs for python process
RUN apt-get update && apt-get install -y python-pip
RUN apt-get install -y gfortran libopenblas-dev liblapack-dev

RUN pip install --upgrade setuptools

RUN apt-get install -y python-numpy
RUN apt-get install -y python-scipy
RUN pip install scikit-learn

RUN pip install psycopg2
RUN pip install pandas==0.24.1
#RUN apt-get install -y python-pandas=0.24.2

EXPOSE 8000

ENTRYPOINT ["/bin/bash", "/usr/src/app/entrypoint.sh"]