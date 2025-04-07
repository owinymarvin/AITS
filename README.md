<!-- ================Backend Configurations======================= -->

py --version #for the python version installed
py -m venv .venv #to configure the project's virtual environment
source .venv/Srcipts/activate #activate the virtual environment
py -m pip install Django #to install Django dependencies
py -m pip install -U pip #to update the pip installation
django-admin startproject backend #create a new backend directory
cd backend
py -m pip install -r ../requirements.txt #install the requirements
