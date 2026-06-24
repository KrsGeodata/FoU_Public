# How to run the fastAPI server on your own machine

---

## Set up your own virtual environment

### Option 1: Setup with bash script

**1. Navigate to Backend dir in project using Git Bash or WSL** \
**NB! It has to be a terminal or environment that can interpret Linux/Unix shell commands** \
`$ cd ..\801_26_LOKAL_LLM\Backend\`

**2. Run the bash script** \
**NB! You need to have python installed** \
`$ source setup_venv.sh`

**3. Run the server** \
`$ fastapi dev main.py`

**4. Exit virtual environment** \
`$ deactivate`

### Option 2: Manual setup

**1. Go to Backend dir in project** \
`$ cd ..\801_26_LOKAL_LLM\Backend\`

**2. Create a virtual environment** \
**NB! You need to have python installed** \
`$ python -m venv .venv`

**3. Activate the virtual environment** \
`$ .venv\Scripts\Activate.ps1`

**4. Upgrade pip to ensure no errors when downloading packages** \
`$ python -m pip install --upgrade pip`

**5. Install packages from requirements.txt** \
`$ pip install -r requirements.txt`

**6. Run the server** \
`$ fastapi dev main.py`

**7. Exit virtual environment** \
`$ deactivate`

---

## Notes:

**requirements.txt** \
Where you specify and download packages and dependencies. Much like a package.json

---
