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
  expectedCount: number[] = [4, 5, 6, 5, 5];

  constructor() {
    this.seats = [
      [
        new Pair('代岑', '李庭葳'), new Pair('何炫毅', '蒋滇粤'),
        new Pair('郭振宇', '桂钰欢'), new Pair('仝亚盈', '樊霖洁')
      ],
      [
        new Pair('蔡磊', '杨李吉'),
        new Pair('余芃澄', '周钇寰'), new Pair('王传栋', '刘涛'),
        new Pair('刘耘松', '王浩宇'), new Pair('单俊杰', '邵振琦')
      ],
      [
        new Pair('车俊贤', '鲍奕丞'), new Pair('于昕呈', '邓轶辰'),
        new Pair('李丞阳', '高若元'),
        new Pair('周至柔', '代一尘'), new Pair('熊晨伊', '龚雪丹'),
        new Pair('陈柯璟', '于阅'),
      ],
      [
        new Pair('鲁唐扬真'), new Pair('李彦节', '吴子墨'),
        new Pair('贺奥凯', '马亚勋'), new Pair('黄启宸', '李博文'),
        new Pair('叶恒铭', '杨曜铭')
      ],
      [
        new Pair('隆竞瑶', '杜卓航'),
        new Pair('韩语哲', '李梓维'), new Pair('郑光朔', '王奕霖'),
        new Pair('宋欣哲', '唐梓耀'), new Pair('刘一诺', '周加灵')
      ]
    ];
  }

  trans(time: number) {
    for (let k = 0; k < time; k++) {
      // 第一步：列移动
      const lastColumn = this.seats[this.seats.length - 1];
      for (let i = this.seats.length - 1; i > 0; i--) {
        this.seats[i] = this.seats[i - 1];
      }
      this.seats[0] = lastColumn;

      // 行移动
      for (let i = 0; i < this.seats.length; i++) {
        const column = this.seats[i];
        const firstRow = column[0];
        for (let j = 0; j < column.length - 1; j++) {
          column[j] = column[j + 1];
        }
        column[column.length - 1] = firstRow;
      }
    }
    if (this.seats[3][0].first !== '鲁唐扬真') {
      for (let i = 3; i >= 0; i--) {
        if (this.seats[i].length === 6) continue;
        this.seats[i].push(this.seats[3][0]);
        this.seats[3][0] = new Pair('鲁唐扬真');
        break;
      }
      for (let i = 0; i < this.seats.length; i++) {
        for (let j = 0; j < this.seats[i].length; j++) {
          if (this.seats[i][j].first === '鲁唐扬真' && i != 3)
            this.seats[i].splice(j, 1);
        }
      }
    }
    for (let i = 1; i <= 4; i++) {
      while (this.seats[i].length < this.expectedCount[i]) {
        for (let j = 0; j <= 4; j++) {
          if (this.seats[j].length > this.expectedCount[j]) {
            this.seats[i].push(this.seats[j][this.seats[j].length - 1]);
            this.seats[j].splice(this.seats[j].length - 1, 1);
            break;
          }
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