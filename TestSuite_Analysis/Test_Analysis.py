import os,csv
import numpy as np
import pandas as pd

rootdir = 'testreports'
row_list = []

for subdir, dirs, files in os.walk(rootdir):
    for file in files:
    	if file.endswith('.txt'):    		
    		subdir_path = (subdir.split('testreports')[1].split('\\')[1].split('\\')[0])
    		filename = str(rootdir) + '/' + str(subdir_path) + '/' + 'surefire-reports/' + str(file)    		    		
    		file1 = open(filename, "r")
    		for line in file1:
    			if 'Tests run:' in line:
    				test_run = line.split('Tests run: ')[1].split(',')[0]
    				failures = line.split('Failures: ')[1].split(',')[0]
    				errors = line.split('Errors: ')[1].split(',')[0]
    				skipped = line.split('Skipped: ')[1].split(',')[0]
    				time_lapsed = line.split('Time elapsed: ')[1].split(' ')[0]    				   				
	    			if 'FAILURE' in line:
	    				failure = 'Yes'
	    			else:
	    				failure = 'No'
	    			test_name = line.split('in ')[1].split('\n')[0]
	    			row_list.append({'Tests Run': test_run,'Failures':failures,'Errors':errors,'Skipped':skipped,'Failure':failure,'Time Elapsed':time_lapsed,'Test Name':test_name})

df = pd.DataFrame(row_list,columns=['Tests Run','Failures','Errors','Skipped','Failure','Time Elapsed','Test Name'])
# df = df.sort_values(['Time Elapsed','Failure'], ascending=[True,False])
df = df.sort_values(['Failures','Time Elapsed'], ascending=[False,True])
df.to_csv("Test_reports.csv", encoding='utf-8', index=False)
        	
