from fastapi import FastAPI
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import Optional
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")
class Pair:
    def __init__(self, first: str, second: Optional[str] = None):
        self.first = first
        self.second = 'None' if second is None else second
class Seats:
    def __init__(self):
        self.seats: list[list[Pair]] = [
            [Pair('刘一诺','周加灵'),Pair('蔡磊','唐梓耀'),Pair('杨李吉','李彦节'),Pair('x'),Pair('蒋滇粤','黄启宸'),Pair('x')],
            [Pair('樊霖洁','仝亚盈'),Pair('韩语哲','王奕霖'),Pair('周至柔','刘涛'),Pair('姜俊衔','代一尘'),Pair('高若元','贺奥凯'),Pair('x')],
            [Pair('车俊贤','桂钰欢'),Pair('陈柯璟','周钇寰'),Pair('王传栋','李梓维'),Pair('郭振宇','何炫毅'),Pair('于昕呈','杨曜铭'),Pair('代岑','余芃澄')],
            [Pair('于阅'),Pair('刘耘松','叶恒铭'),Pair('宋欣哲','郑光朔'),Pair('马亚勋','邵振琦'),Pair('吴子墨','李博文'),Pair('邓轶辰','李庭葳')],
            [Pair('鲁唐扬真'),Pair('隆竞瑶','杜卓航'),Pair('李丞阳','鲍奕丞'),Pair('熊晨伊','龚雪丹'),Pair('艾子喻','单俊杰'),Pair('王浩宇')]
        ]
        self.current_weeks: int = 0

    def trans(self,time:int):
        """
        变换座位表,time表示变换的周数,注意每次都是从最初的基础上将进行time次变换
        .param time: int 变换的周数
        .return : None
        """
        #第1-1步，全部列向窗户方向移动（即列数递增），最后一列移到第一列
        for k in range(time):
            #第1-1步，全部列向窗户方向移动（即列数递增），最后一列移到第一列
            last_column = self.seats[-1]#存储最后一列
            for i in range(len(self.seats) - 1, 0, -1):#倒序遍历
                self.seats[i] = self.seats[i - 1]
            self.seats[0] = last_column
            #第1-2步，每一列的每一行向讲台方向移动（即行数递减），第一行移到最后一行，注意只有5人那一列需要特判
            for i in range(len(self.seats)):
                if i == (self.current_weeks+2)%5:#如果是只有5人那一列，注意此时已经移动过列了
                    first_row = self.seats[i][0]#存储第一行
                    for j in range(0,4):
                        self.seats[i][j] = self.seats[i][j + 1]
                    self.seats[i][4] = first_row
                else:
                    first_row = self.seats[i][0]#存储第一行
                    for j in range(0,len(self.seats[i])-1):
                        self.seats[i][j] = self.seats[i][j + 1]
                    self.seats[i][len(self.seats[i])-1] = first_row#最后一排等于第一排
            self.current_weeks = (self.current_weeks + 1) % 5#当前周数加1
        #print(self)#debug
        #第2步，把只有4人那一列的空位用当前的第一列的对应位置的人填上，并删除第一列的那两人（也可能是一人）
        index_of_4_people_column:int = time%5#只有4人那一列的索引
        index_of_x:int = 0
        for i in range(len(self.seats[index_of_4_people_column])):
            if self.seats[index_of_4_people_column][i].first == 'x':
                index_of_x = i
                break
        self.seats[index_of_4_people_column][index_of_x] = self.seats[0][index_of_x]
        self.seats[0][index_of_x] = Pair('x')
        for i in range(len(self.seats[index_of_4_people_column])):
            if self.seats[index_of_4_people_column][i].first == 'x':
                index_of_x = i
                break
        if self.seats[0][index_of_x].first != 'x':
            self.seats[index_of_4_people_column][index_of_x] = self.seats[0][index_of_x]
            self.seats[0][index_of_x] = Pair('x')
        #第3步，把第一列的人移到正常位置（即避开原来有承重柱的位置），并把current_weeks加1
        now_available_people_in_first_column:list[Pair] = []
        for i in range(len(self.seats[0])):
            if self.seats[0][i].first != 'x':
                if self.seats[0][i].first != '鲁唐扬真':
                    now_available_people_in_first_column.append(self.seats[0][i])
                else:#特判：鲁唐杨真必须坐在当前列的第一排，因为他坐在后面看不清楚
                    now_available_people_in_first_column.insert(0,self.seats[0][i])
        self.seats[0][0]=now_available_people_in_first_column[0]
        self.seats[0][1]=now_available_people_in_first_column[1]
        self.seats[0][2]=now_available_people_in_first_column[2]
        self.seats[0][3]=Pair('x')
        if len(now_available_people_in_first_column) == 4:
            self.seats[0][4]=now_available_people_in_first_column[3]
        else:
            self.seats[0][4]=Pair('x')
        self.seats[0][5]=Pair('x')
        #特判：鲁唐杨真必须坐在当前列的第一排，因为他坐在后面看不清楚
        column_of_lutang:int = 0
        row_of_lutang:int = 0
        for column in range(len(self.seats)):
            for row in range(len(self.seats[column])):
                if self.seats[column][row].first == '鲁唐扬真':
                    column_of_lutang = column
                    row_of_lutang = row
                    break
        if column_of_lutang != 0:#这里处理他不在第一列的情况
            self.seats[column_of_lutang].remove(self.seats[column_of_lutang][row_of_lutang])
            last_row_of_lutang = self.seats[column_of_lutang][-1]
            for i in range(len(self.seats[column_of_lutang])-1,0,-1):
                self.seats[column_of_lutang][i] = self.seats[column_of_lutang][i-1]
            self.seats[column_of_lutang][0] = last_row_of_lutang
            self.seats[column_of_lutang].insert(0, Pair('鲁唐扬真'))

    def to_json(self):
        result = {}
        for i in range(len(self.seats)):
            result[str(i)] = []
            for j in range(len(self.seats[i])-1, -1, -1):
                result[str(i)].append({'first': self.seats[i][j].first, 'second': self.seats[i][j].second})
        return result

class SeatRequest(BaseModel):
    time: int

@app.post("/api/py/seat")
async def get_seats(request: SeatRequest = Body(...)):
    try:
        seats = Seats()
        seats.trans(request.time)
        return seats.to_json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))