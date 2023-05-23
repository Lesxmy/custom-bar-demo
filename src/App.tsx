import * as echarts from "echarts";
import { useEffect } from "react";
import "./styles.css";
type data11Dto =
  | {
      name: string;
      dataList: {
        color: string;
        name: string;
        data: number;
        goal: number[];
        differenceValue: number;
      }[];
    }
  | {
      name: string;
      dataList: {
        color: string;
        name: string;
        data: number;
        goal: number[];
        differenceValue: string;
      }[];
    };
export default function App() {
  const data11: data11Dto[] = [
    {
      name: "B1",
      dataList: [
        {
          color: "pink",
          name: "得率",
          data: 100,
          goal: [22, 40],
          differenceValue: 1
        }
      ]
    },
    {
      name: "B4",
      dataList: [
        {
          color: "pink",
          name: "得率",
          data: 120,
          goal: [22],
          differenceValue: 1
        }
      ]
    },
    {
      name: "B5",
      dataList: [
        {
          color: "pink",
          name: "得率",
          data: 100,
          goal: [22, 26],
          differenceValue: 1
        }
      ]
    },
    {
      name: "C3",
      dataList: [
        {
          color: "yellow",
          name: "喷金得率",
          data: 100,
          goal: [],
          differenceValue: ""
        },
        {
          color: "#ffcc99",
          name: "喷膜得率",
          data: 150,
          goal: [],
          differenceValue: ""
        },
        {
          color: "green",
          name: "切条得率",
          data: 200,
          goal: [],
          differenceValue: ""
        }
      ]
    },
    {
      name: "C6",
      dataList: [
        {
          color: "purple",
          name: "喷金",
          data: 50,
          goal: [30],
          differenceValue: ""
        },
        {
          color: "#006BFF",
          name: "喷膜",
          data: 80,
          goal: [40, 60],
          differenceValue: ""
        },
        {
          color: "#ff6c37",
          name: "切条",
          data: 130,
          goal: [50],
          differenceValue: ""
        }
      ]
    }
  ];
  const renderItem = (params: any, api: any) => {
    let categoryIndex = api.value(0);
    let start = api.coord([categoryIndex, api.value(1)]);
    let end = api.coord([categoryIndex, api.value(2)]);

    const num = api.value(4); // 每个系列柱子数
    const currentIndex = api.value(3);
    const isOdd = num % 2 === 0; //柱子数是否偶数
    const midN = isOdd ? num / 2 : (num + 1) / 2;

    // 每条柱子固定宽度
    let width = 25;
    let rectX = start[0] - width / 2;
    const FIXED_WIDTH = 10; // 柱子间距

    if (num > 1) {
      if (isOdd) {
        if (currentIndex <= midN) {
          // 中位数左侧
          rectX =
            start[0] -
            width / 2 -
            width / 2 +
            (currentIndex - midN) * width -
            FIXED_WIDTH * (midN + 1 - currentIndex);
        } else {
          // 中位数右侧
          rectX =
            start[0] -
            width / 2 +
            width / 2 +
            (currentIndex - midN - 1) * width +
            FIXED_WIDTH * (currentIndex - midN);
        }
      } else {
        rectX =
          start[0] - width / 2 + (currentIndex - midN) * (width + FIXED_WIDTH);
      }
    }

    return {
      type: "rect",
      shape: echarts.graphic.clipRectByRect(
        { x: rectX, y: end[1], width: width, height: start[1] - end[1] },
        {
          x: params.coordSys.x,
          y: params.coordSys.y,
          width: params.coordSys.width,
          height: params.coordSys.height
        }
      ),
      style: api.style()
    };
  };
  const handledata = (data11: data11Dto[]) => {
    // let legendName: any[] = [];
    let xData = data11.map((item: any) => {
      return item.name;
    });
    let list: any[] = [];
    data11.forEach((item, index) => {
      let count = 1;
      item.dataList.forEach((a) => {
        list.push({
          name: a.name,
          qyName: item.name,
          value: [index, 0, a.data, count, item.dataList.length],
          differenceValue: a.differenceValue,
          goal: a.goal,
          itemStyle: { normal: { color: a.color } }
        });
        a.goal.forEach((b) => {
          list.push({
            itemStyle: { normal: { color: "red" } },
            name: "目标值",
            goal: a.goal,
            differenceValue: a.differenceValue,
            qyName: item.name,
            value: [index, b, b + 0.4, count, item.dataList.length]
          });
        });
        count++;
      });
    });
    let dataInfo: { [key: string]: any[] } = {};
    // 将区域名相同部分提取
    list.forEach((item) => {
      let { qyName } = item;
      if (!dataInfo[qyName]) {
        dataInfo[qyName] = [
          {
            ...item
          }
        ];
      } else {
        dataInfo[qyName].push(item);
      }
    });
    return { xData, data: dataInfo };
  };
  const handleOption = (xData: any, data: any) => {
    const option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        },
        formatter: (params: any) => {
          let dataMes = params[0].data;
          const title = '<p style="color:#000">' + dataMes.qyName + "</p>";
          let showGoal = true;
          let count: any;
          const seriesStr = params.reduce((str: any, item: any, index: any) => {
            const symbol =
              '<span style="display: inline-block;width: 10px; height: 10px; margin-right: 8px; border-radius: 50%; background-color:' +
              item.color +
              '"></span>';
            if (item.name === "目标值" && !showGoal) {
              str += "";
              return str;
            }
            if (count !== item.value[3]) {
              showGoal = true;
            }
            // 判断目标值是否为区间
            const goal = params[index]?.data.goal;
            let goalValue =
              goal.length === 2 ? goal[0] + "-" + goal[1] : goal[0];
            let value = item.name === "目标值" ? goalValue : item.value[2];
            let name = item.name;
            console.log(goalValue, "goalValue");
            str +=
              '<div style="minWidth: 300px; color: #000;font-size: 14px; display: flex; align-items: center; justify-content: space-between;">' +
              '<span style="display: flex; align-items: center;">' +
              symbol +
              name +
              "</span>" +
              '<span style="margin-left: 30px">' +
              value +
              "</span>" +
              "</div>";
            // 差值渲染
            if (name === "目标值") {
              showGoal = false;
              str +=
                '<div style="minWidth: 300px; color: #000;font-size: 14px; display: flex; align-items: center; justify-content: space-between;">' +
                '<span style="display: flex; align-items: center;margin-left:18px">' +
                "差值" +
                "</span>" +
                '<span style="margin-left: 30px">' +
                params[index]?.data.differenceValue +
                "</span>" +
                "</div>";
              if (params.length > 4) {
                str +=
                  '<hr style="background-color:blue; height:1px; border:none;margin:5px 0">' +
                  "</hr>";
              }
            }
            return str;
          }, "");
          return title + seriesStr;
        }
      },
      grid: {
        top: 30,
        left: 30,
        right: 30,
        bottom: 10,
        containLabel: true
      },
      xAxis: {
        type: "category",
        data: xData,
        axisTick: {
          show: false,
          alignWithLabel: true //坐标轴线居中对齐
        },
        splitLine: { show: false }
      },
      yAxis: { type: "value", splitLine: { show: false } },
      series: xData.map((item: any) => {
        return {
          type: "custom",
          label: {
            normal: {
              show: true,
              position: "top",
              color: "#666",
              textBorderColor: "transparent",
              formatter: (param: any) => {
                if (param.name === "目标值") {
                  return "";
                }
              }
            }
          },
          renderItem: renderItem,
          encode: { y: [1, 2], x: 0 },
          name: item,
          data: data[item]
        };
      })
    };
    return option;
  };
  useEffect(() => {
    const dom = document.getElementById("chart-container") as HTMLElement;
    const myChart = echarts.init(dom);
    const { xData, data } = handledata(data11);
    const option = handleOption(xData, data);
    console.log("option:", option);
    console.log("option:", option && typeof option === "object");
    if (option && typeof option === "object") {
      myChart.setOption(option);
    }
    window.addEventListener("resize", myChart.resize as any);
    return () => {
      window.removeEventListener("resize", myChart.resize as any);
    };
  }, []);
  return <div id="chart-container"></div>;
}
