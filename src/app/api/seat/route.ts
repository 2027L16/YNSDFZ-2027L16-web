export async function POST(req: Request) {
  try {
    const { time } = await req.json();
    const seats = new Seats();
    seats.trans(time);
    return Response.json(seats.toJson(), { status: 200 });
  } catch (error: any) {
    console.error('Error processing request:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
class Pair {
  first: string;
  second: string;
  constructor(first: string, second: string = 'None') {
    this.first = first;
    this.second = second;
  }
}

class Seats {
  seats: Pair[][];
  currentWeeks: number;

  constructor() {
    this.seats = [
      [
        new Pair('代岑', '李庭葳'), new Pair('何炫毅', '蒋滇粤'),
        new Pair('郭振宇', '桂钰欢'), new Pair('x'),
        new Pair('仝亚盈', '樊霖洁'), new Pair('x')
      ],
      [
        new Pair('蔡磊', '杨李吉'),
        new Pair('余芃澄', '周钇寰'), new Pair('王传栋', '刘涛'),
        new Pair('刘耘松', '王浩宇'), new Pair('单俊杰', '邵振琦'), new Pair('x')
      ],
      [
        new Pair('车俊贤', '鲍奕丞'), new Pair('于昕呈', '邓轶辰'),
        new Pair('李丞阳', '高若元'),
        new Pair('周至柔', '代一尘'), new Pair('熊晨伊', '龚雪丹'),
        new Pair('陈柯璟', '于阅'),
      ],
      [
        new Pair('x'), new Pair('李彦节', '吴子墨'),
        new Pair('贺奥凯', '马亚勋'), new Pair('黄启宸', '李博文'),
        new Pair('叶恒铭', '杨曜铭'), new Pair('x')
      ],
      [
        new Pair('隆竞瑶', '杜卓航'),
        new Pair('韩语哲', '李梓维'), new Pair('郑光朔', '王奕霖'),
        new Pair('宋欣哲', '唐梓耀'), new Pair('刘一诺', '周加灵'), new Pair('x')
      ]
    ];
    this.currentWeeks = 0;
  }

  trans(time: number) {
    for (let k = 0; k < time; k++) {
      // 第一步：列移动
      const lastColumn = this.seats[this.seats.length - 1];
      for (let i = this.seats.length - 1; i > 0; i--) {
        this.seats[i] = this.seats[i - 1];
      }
      this.seats[0] = lastColumn;

      // 第二步：行移动
      for (let i = 0; i < this.seats.length; i++) {
        const column = this.seats[i];
        if (i === (this.currentWeeks + 2) % 5 || i === this.currentWeeks % 5) {
          const firstRow = column[0];
          for (let j = 0; j < 4; j++) {
            column[j] = column[j + 1];
          }
          column[4] = firstRow;
        } else {
          const firstRow = column[0];
          for (let j = 0; j < column.length - 1; j++) {
            column[j] = column[j + 1];
          }
          column[column.length - 1] = firstRow;
        }
      }
      this.currentWeeks = (this.currentWeeks + 1) % 5;
    }

    // 处理空位
    const index4Column = time % 5;
    let xIndex = this.seats[index4Column].findIndex(p => p.first === 'x');
    if (xIndex !== -1) {
      this.seats[index4Column][xIndex] = this.seats[0][xIndex];
      this.seats[0][xIndex] = new Pair('x');
    }
    xIndex = this.seats[index4Column].findIndex(p => p.first === 'x');
    if (this.seats[0][xIndex].first !== 'x') {
      this.seats[index4Column][xIndex] = this.seats[0][xIndex];
      this.seats[0][xIndex] = new Pair('x');
    }

    let nowAvailableInFirstColumn: Pair[] = [];
    for (let i = 0; i < this.seats[0].length; i++) {
      if (this.seats[0][i].first !== 'x') {
        nowAvailableInFirstColumn.push(this.seats[0][i]);
      }
    }
    this.seats[0][0] = nowAvailableInFirstColumn[0]
    this.seats[0][1] = nowAvailableInFirstColumn[1]
    this.seats[0][2] = nowAvailableInFirstColumn[2]
    this.seats[0][3] = new Pair('x')
    if (nowAvailableInFirstColumn.length == 4) {
      this.seats[0][4] = nowAvailableInFirstColumn[3]
    }
    else {
      this.seats[0][4] = new Pair('x')
    }
    this.seats[0][5] = new Pair('x')
    if (this.seats[4][5].first !== 'x') {
      let available: number[][] = [[0, 4], [1, 5], [2, 5], [3, 5]];
      for (let i = 0; i < available.length; i++) {
        if (this.seats[available[i][0]][available[i][1]].first === 'x') {
          this.seats[available[i][0]][available[i][1]] = this.seats[4][5]
          this.seats[4][5] = new Pair('x')
          break
        }
      }
    }
    // 处理鲁唐扬真
    if (this.seats[3][5].first !== 'x') {
      if (this.seats[2][5].first !== 'x') {
        this.seats[1][5] = this.seats[2][5];
      }
      this.seats[2][5] = this.seats[3][5];
    }

    for (let i = 5; i > 0; i--) {
      this.seats[3][i] = this.seats[3][i - 1];
    }
    this.seats[3][0] = new Pair('鲁唐扬真')

    // 处理每个人的前空位
    for (let i = 1; i < this.seats.length; i++) {
      for (let j = 0; j < this.seats[i].length - 1; j++) {
        if (this.seats[i][j].first === 'x' && this.seats[i][j + 1].first !== 'x') {
          this.seats[i][j] = this.seats[i][j + 1];
          this.seats[i][j + 1] = new Pair('x');
        }
      }
      for (let j = 0; j < this.seats[i].length - 1; j++) {
        if (this.seats[i][j].first === 'x' && this.seats[i][j + 1].first !== 'x') {
          this.seats[i][j] = this.seats[i][j + 1];
          this.seats[i][j + 1] = new Pair('x');
        }
      }
    }
  }

  toJson() {
    const result: { [key: number]: { first: string; second: string }[] } = {};
    for (let i = 0; i < this.seats.length; i++) {
      result[i] = [];
      for (let j = this.seats[i].length - 1; j >= 0; j--) {
        result[i].push({
          first: this.seats[i][j].first,
          second: this.seats[i][j].second
        });
      }
    }
    return result;
  }
}