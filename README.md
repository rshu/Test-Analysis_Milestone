# Test-Analysis-Milestone
Second milestone of group project for CSC - 519

Team member
* Nawshin Tabassum - ntabass
* Joymallya Chakraborty - jchakra
* Rui Shu - rshu
* Pingping Chen - pchen23

#### Instructions to run the project
To run the project, first do the following:

`git clone https://github.ncsu.edu/jchakra/Test-Analysis-Milestone.git `

`cd Test-Analysis-Milestone`

After setting up the key, you can run the following command:

`ansible-playbook playbook.yml -i inventory.ini`


### Coverage/Jenkins support and Commit Fuzzer

In this milestone, the following tasks are completed:
We have installed **Jacoco** plugin to the jenkins server to measure coverage and display a report within jenkins on every commit. We developed a [fuzzer](https://github.ncsu.edu/jchakra/Test-Analysis-Milestone/tree/master/fuzzing) that adds new random changes to source code. These changes are automatically committed by the fuzzer, which triggers a build in jenkins and run the test suite.

We ran all the steps automatically through ansible scripts. 
Our filesystem is structured in roles. 
As per instructions, we have one [variable.yml](https://github.ncsu.edu/jchakra/Test-Analysis-Milestone/blob/master/variables.yml) file, one [inventroy.ini](https://github.ncsu.edu/jchakra/Test-Analysis-Milestone/blob/master/inventory.ini) file and one [playbook.yml](https://github.ncsu.edu/jchakra/Test-Analysis-Milestone/blob/master/playbook.yml) file.
This playbook runs all the roles sequentially.

roles
- jenkins
- install
- fuzzer
- git (100 times)


The [jenkins](https://github.ncsu.edu/jchakra/Test-Analysis-Milestone/blob/master/roles/jenkins/tasks/main.yml) and [install](https://github.ncsu.edu/jchakra/Test-Analysis-Milestone/blob/master/roles/install/tasks/main.yml) role are the same from the previous milestone. 
These files are used to setup the jenkins server, install the plugins and dependencies and copy all the jobs to the server.

The [fuzzer](https://github.ncsu.edu/jchakra/Test-Analysis-Milestone/blob/master/roles/fuzzer/tasks/main.yml) role is used only once to setup the files and configurations before running the fuzzer.
Our [fuzzing](https://github.ncsu.edu/jchakra/Test-Analysis-Milestone/tree/master/fuzzing) folder contains the source code that we used for fuzzing.

The [git](https://github.ncsu.edu/jchakra/Test-Analysis-Milestone/blob/master/roles/git/tasks/main.yml) role is used to run the fuzzer on itrust source code, and trigger a build by commiting the changes using a [post-commit](https://github.ncsu.edu/jchakra/Test-Analysis-Milestone/blob/master/roles/fuzzer/templates/post-commit) hook. 
After the build is finished, the testreports are saved in a folder and the commit is reverted back to initial git commit.
All of these is done 100 times sequentially using a delay to allow the build to finish before moving on. We are running this role from the playbook as a [task](https://github.ncsu.edu/jchakra/Test-Analysis-Milestone/blob/2c0f56f7b7a23438c4520559b6e291d7a0169964/playbook.yml#L9).

### Test prioritization analysis

We examined the results of the 100 commit fuzzer runs and test suite runs. The Jacoco plugin produces the reports that we stored and analyzed using [Test_Analysis.py](https://github.ncsu.edu/jchakra/Test-Analysis-Milestone/blob/master/TestSuite_Analysis/Test_Analysis.py). All the test suite run reports are in [testreports](https://github.ncsu.edu/jchakra/Test-Analysis-Milestone/tree/master/TestSuite_Analysis/testreports) folder. We sorted the test cases based on time to execute and number of failed tests discovered. The result is shown here-

[Test_reports](https://docs.google.com/spreadsheets/d/1Hewd4iOlTC5hA1mbjn4HCVYmIr5QIvhmk7tM_dT-rfc/edit?usp=sharing)

### Analysis

**Fuzzer**
The fuzzer adds random fuzzing operations to the itrust source code.
Fuzzing operations:

* swap "<" with ">"
  
We successfully implemented this and made sure that this change is limited to the conditional statements only.
* swap "==" with "!="
  
We successfully implemented this.
* swap 0 with 1

We successfully implemented this.
* change content of "strings" in code.

We tried to implement this, but when we ran the fuzzed code of itrust, we faced several issues on jenkins. We tried to debug those issues, but those were related to itrust source code. As the main purpose of this milestone is making a successful fuzzer, we decided not to customize our fuzzer to much for itrust and we kept our fuzzing logic present in the source code, but didn't use while measuring itrust builds.

* New operation

  We tried three different ideas. 
  * replace "+" operator with "-" operator - Issue faced was "++" became "-+"
  * replace "\*" operator with "/" operator. - Issue faced was "/*" became "//"
  * replace "&&" with "||" operator. - Issue faced was conditions throwing exceptions
 
These logics are present in the source code but commented. The fuzzing logics need some improvements to make iTrust source code buildable even after fuzzing. By using the fuzzer we tested the strength of test files in itrust, without acquiring any knowledge about system behavior. It also tested the error handling procedures of itrust by generating some invalid statements.
   
 
**Test prioritization**

We sorted all the tests depending upon no. of failures(higher is better) and elapsed time (lower is better). 
From our analysis, five most important tests are the following ones -
* edu.ncsu.csc.itrust2.apitest.APIPatientTest
* edu.ncsu.csc.itrust2.unit.DomainObjectTest
* edu.ncsu.csc.itrust2.unit.LabProcedureTest
* edu.ncsu.csc.itrust2.unit.LockoutTest
* edu.ncsu.csc.itrust2.apitest.APIFoodDiaryTest

The significance of this prioritization analysis is now we know which tests can quickly find most number of bugs. 

**iTrust**
* [iTrust](https://github.com/rshu/iTrust) - Source repository
Running an existing static analysis tool on the source code using FindBugs to process its results, and report its findings. The findings can be found [here](https://github.ncsu.edu/jchakra/Test-Analysis-Milestone/tree/master/iTrustReport/FindBugsReport).
![magic](/ScreenShots/findbugs1.png)
![magic](/ScreenShots/findbugs2.png)


Use JaCoCo to test the build minimum testing criteria (if test case failed, the build will fail, too) and use FindBugs to test if builds reach analysis criteria. Fail builds that fail analysis checks, such as FindBug's "Method concatenates strings using + in a loop".
![magic](/ScreenShots/Jacoco.png)
![magic](/ScreenShots/findbugs3.png)

This static testing can help developer improve the quality of code and code coverage. They can track the implementation can make improvements to source code. In addition, they can customize the tool with testing criteria to test the source code, which saves a lot time for the development.

**checkbox.io**

* [Checkbox.io](https://github.com/rshu/checkbox.io) - Source repository

For this work, use the esprima library to parse JavaScript code into AST. Esprima is able to traverse each function and calculate the metrics. To be specific, we extend our build job from these aspects:

1. Count the max number of conditions within an if statement in a function through node type "IFStatement".

2. Count the length of a function by figuring out the start line and end line.

3. Detect whether there exists tenary expression in the function. An example of tenary expressing looks like "var canDrive = age > 16 ? 'yes' : 'no';", which is not a good practice and should be avoided.

We analyze the JavaScript code in /checkbox.io/server-side/site/routes, and print out the metrics for each detected function. We also set the threashold for each metric, if any metric passes over the threshold, the code execution throws an error and failing the job building.

We believe these checks help software developers to form a good practice in developments. For example, maintaining a small function is trying to achieve a goal of high cohesion and low coupling, which would likely to introduce less software bugs in a small function.

### Work distribution
In this milestone, we seperated our work into two groups.

Group A (Nawshin and Joymallya) developed the fuzzer to add random changes to source code.  We set up Jenkins to run the fuzzer and store the Jacoco report for every test suite run. We created a commit hook to automatically trigger build. We ran the 100 the builds and used the test suite reports for test prioritization analysis. Then we generated the report for test prioritization. 

Group B (Rui Shu and Pingping Chen) are mainly responsible for the analysis code. We extend the iTrust job by analyzing the source code with existing tool (i.e., FindBugs), process the results and reports the finding. For iTrust, we also extend the job from two aspects: We use the Jacoco plugin in pom.xml to analyze the code coverage, and set the limit for job builing. If the code coverage is less than 50%, we fail the job bulding. Or if the test cases fail, the job building will also fail. We use the FindBugs plugin in pom.xml to find bugs that concatenates strings in a for loop. If it is the case, the job building fails. For the checkbox.io, we mainly use esprima to parse the JavaScript codes and calcuate different metrics, i.e., max condition, function length, and tenary expression. If the metric exceeds the threshold, the job building also fails.


Here is the [Screencast](https://drive.google.com/file/d/1X2NJn9becNp9Z-5plQsI-fl4TSQO2aVr/view?usp=sharing).
For the demo of static analyze part, please visit [fail minimum testing criteria](https://drive.google.com/file/d/1nw_nQb4J-tCJIrIJPDI_vwB-ncQ37Ok3/view?usp=sharing) and [fail analysis criteria](https://drive.google.com/file/d/1uYtrCnJ7vk-hZLYv9kGpiKEn5WRqT3nH/view?usp=sharing).
