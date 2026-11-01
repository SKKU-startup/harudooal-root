// Original choices and seed scores; candidate, not a validated short-form instrument.
const surveyDefinition = {
  "version": "short-12-candidate-1",
  "status": "unvalidated",
  "sourceVersion": 2,
  "sourceCheckedAt": "2026-11-01",
  "questions": [
    {
      "questionId": 49,
      "questionNum": 1,
      "dimension": "AS",
      "text": "지난 한 달간, 땀 날 정도로 운동한 날은 일주일에 며칠이었나요?",
      "weight": 1.2,
      "category": "exercise_frequency",
      "options": [
        {
          "responseId": 241,
          "value": 1,
          "label": "0일 (전혀 안 했어요)",
          "score": 1
        },
        {
          "responseId": 242,
          "value": 2,
          "label": "1~2일",
          "score": 2
        },
        {
          "responseId": 243,
          "value": 3,
          "label": "3~4일",
          "score": 3
        },
        {
          "responseId": 244,
          "value": 4,
          "label": "5~6일",
          "score": 4
        },
        {
          "responseId": 245,
          "value": 5,
          "label": "매일 했어요",
          "score": 5
        }
      ]
    },
    {
      "questionId": 53,
      "questionNum": 5,
      "dimension": "AS",
      "text": "업무나 공부할 때 앉아 있는 시간은 하루에 몇 시간인가요?",
      "weight": 1,
      "category": "sedentary_time_work",
      "options": [
        {
          "responseId": 261,
          "value": 1,
          "label": "2시간 미만",
          "score": 5
        },
        {
          "responseId": 262,
          "value": 2,
          "label": "2~4시간",
          "score": 4
        },
        {
          "responseId": 263,
          "value": 3,
          "label": "4~6시간",
          "score": 3
        },
        {
          "responseId": 264,
          "value": 4,
          "label": "6~8시간",
          "score": 2
        },
        {
          "responseId": 265,
          "value": 5,
          "label": "8시간 이상",
          "score": 1
        }
      ]
    },
    {
      "questionId": 56,
      "questionNum": 8,
      "dimension": "AS",
      "text": "충분히 잤는데도 아침에 피곤한 날이 일주일에 며칠이나 있었나요?",
      "weight": 1.2,
      "category": "fatigue",
      "options": [
        {
          "responseId": 276,
          "value": 1,
          "label": "거의 없어요",
          "score": 5
        },
        {
          "responseId": 277,
          "value": 2,
          "label": "1~2일",
          "score": 4
        },
        {
          "responseId": 278,
          "value": 3,
          "label": "3~4일",
          "score": 3
        },
        {
          "responseId": 279,
          "value": 4,
          "label": "5~6일",
          "score": 2
        },
        {
          "responseId": 280,
          "value": 5,
          "label": "거의 매일이에요",
          "score": 1
        }
      ]
    },
    {
      "questionId": 59,
      "questionNum": 11,
      "dimension": "PR",
      "text": "지난 1년간 건강검진을 받으셨나요?",
      "weight": 1.3,
      "category": "preventive_care",
      "options": [
        {
          "responseId": 291,
          "value": 1,
          "label": "안 받았고, 받을 생각도 없어요",
          "score": 1
        },
        {
          "responseId": 292,
          "value": 2,
          "label": "안 받았는데, 올해는 받으려고요",
          "score": 2
        },
        {
          "responseId": 293,
          "value": 3,
          "label": "2년 전쯤 받았어요",
          "score": 3
        },
        {
          "responseId": 294,
          "value": 4,
          "label": "1년 전쯤 받았어요",
          "score": 4
        },
        {
          "responseId": 295,
          "value": 5,
          "label": "올해 받았어요",
          "score": 5
        }
      ]
    },
    {
      "questionId": 65,
      "questionNum": 17,
      "dimension": "PR",
      "text": "건강 정보를 얼마나 자주 찾아보시나요?",
      "weight": 0.9,
      "category": "health_awareness",
      "options": [
        {
          "responseId": 321,
          "value": 1,
          "label": "거의 관심 없어요",
          "score": 1
        },
        {
          "responseId": 322,
          "value": 2,
          "label": "필요할 때만 검색해요",
          "score": 2
        },
        {
          "responseId": 323,
          "value": 3,
          "label": "가끔 관심 있는 건 찾아봐요",
          "score": 3
        },
        {
          "responseId": 324,
          "value": 4,
          "label": "자주 찾아보고 공부해요",
          "score": 4
        },
        {
          "responseId": 325,
          "value": 5,
          "label": "적극적으로 학습해요",
          "score": 5
        }
      ]
    },
    {
      "questionId": 68,
      "questionNum": 20,
      "dimension": "PR",
      "text": "가벼운 증상(두통, 소화불량 등)이 있으면 어떻게 하시나요?",
      "weight": 1,
      "category": "self_care",
      "options": [
        {
          "responseId": 336,
          "value": 1,
          "label": "그냥 참아요",
          "score": 1
        },
        {
          "responseId": 337,
          "value": 2,
          "label": "약 사서 먹어요",
          "score": 2
        },
        {
          "responseId": 338,
          "value": 3,
          "label": "약사랑 상담 후 먹어요",
          "score": 3
        },
        {
          "responseId": 339,
          "value": 4,
          "label": "원인 파악 후 생활습관을 바꿔요",
          "score": 4
        },
        {
          "responseId": 340,
          "value": 5,
          "label": "증상 기록하고 패턴을 분석해요",
          "score": 5
        }
      ]
    },
    {
      "questionId": 69,
      "questionNum": 21,
      "dimension": "BI",
      "text": "지난 일주일간, 세 끼를 규칙적으로 먹은 날은 며칠이었나요?",
      "weight": 1.1,
      "category": "meal_regularity",
      "options": [
        {
          "responseId": 341,
          "value": 1,
          "label": "0~1일",
          "score": 1
        },
        {
          "responseId": 342,
          "value": 2,
          "label": "2~3일",
          "score": 2
        },
        {
          "responseId": 343,
          "value": 3,
          "label": "4~5일",
          "score": 3
        },
        {
          "responseId": 344,
          "value": 4,
          "label": "6일",
          "score": 4
        },
        {
          "responseId": 345,
          "value": 5,
          "label": "매일",
          "score": 5
        }
      ]
    },
    {
      "questionId": 71,
      "questionNum": 23,
      "dimension": "BI",
      "text": "채소(나물, 샐러드 등)는 하루에 얼마나 드시나요?",
      "weight": 1.3,
      "category": "food_variety",
      "options": [
        {
          "responseId": 351,
          "value": 1,
          "label": "거의 안 먹어요",
          "score": 1
        },
        {
          "responseId": 352,
          "value": 2,
          "label": "하루 1번 정도",
          "score": 2
        },
        {
          "responseId": 353,
          "value": 3,
          "label": "하루 2번",
          "score": 3
        },
        {
          "responseId": 354,
          "value": 4,
          "label": "하루 3번",
          "score": 4
        },
        {
          "responseId": 355,
          "value": 5,
          "label": "매 끼니마다",
          "score": 5
        }
      ]
    },
    {
      "questionId": 78,
      "questionNum": 30,
      "dimension": "BI",
      "text": "라면, 햄버거, 피자, 치킨 같은 음식은 얼마나 자주 드시나요?",
      "weight": 1.2,
      "category": "processed_foods",
      "options": [
        {
          "responseId": 386,
          "value": 1,
          "label": "거의 안 먹어요",
          "score": 5
        },
        {
          "responseId": 387,
          "value": 2,
          "label": "월 2~3회",
          "score": 4
        },
        {
          "responseId": 388,
          "value": 3,
          "label": "주 1~2회",
          "score": 3
        },
        {
          "responseId": 389,
          "value": 4,
          "label": "주 3~4회",
          "score": 2
        },
        {
          "responseId": 390,
          "value": 5,
          "label": "거의 매일",
          "score": 1
        }
      ]
    },
    {
      "questionId": 84,
      "questionNum": 36,
      "dimension": "CT",
      "text": "지난 한 달간, 스트레스 받은 날이 일주일에 며칠 정도였나요?",
      "weight": 1.3,
      "category": "stress_level",
      "options": [
        {
          "responseId": 416,
          "value": 1,
          "label": "거의 없었어요",
          "score": 5
        },
        {
          "responseId": 417,
          "value": 2,
          "label": "가끔 (2~3일)",
          "score": 4
        },
        {
          "responseId": 418,
          "value": 3,
          "label": "자주 (4~5일)",
          "score": 3
        },
        {
          "responseId": 419,
          "value": 4,
          "label": "대부분 (6일)",
          "score": 2
        },
        {
          "responseId": 420,
          "value": 5,
          "label": "거의 매일",
          "score": 1
        }
      ]
    },
    {
      "questionId": 87,
      "questionNum": 39,
      "dimension": "CT",
      "text": "스트레스 받은 후 평소 컨디션으로 돌아오는 데 얼마나 걸리나요?",
      "weight": 1.1,
      "category": "stress_coping",
      "options": [
        {
          "responseId": 431,
          "value": 1,
          "label": "아주 오래 (며칠~몇 주)",
          "score": 1
        },
        {
          "responseId": 432,
          "value": 2,
          "label": "좀 오래 (1~2일)",
          "score": 2
        },
        {
          "responseId": 433,
          "value": 3,
          "label": "보통 (하루 정도)",
          "score": 3
        },
        {
          "responseId": 434,
          "value": 4,
          "label": "빨라요 (몇 시간)",
          "score": 4
        },
        {
          "responseId": 435,
          "value": 5,
          "label": "아주 빨라요 (바로~1시간)",
          "score": 5
        }
      ]
    },
    {
      "questionId": 91,
      "questionNum": 43,
      "dimension": "CT",
      "text": "잠들기 어려운 날이 일주일에 며칠 정도였나요?",
      "weight": 1.3,
      "category": "sleep_quality",
      "options": [
        {
          "responseId": 451,
          "value": 1,
          "label": "거의 없어요",
          "score": 5
        },
        {
          "responseId": 452,
          "value": 2,
          "label": "가끔 (2~3일)",
          "score": 4
        },
        {
          "responseId": 453,
          "value": 3,
          "label": "자주 (4~5일)",
          "score": 3
        },
        {
          "responseId": 454,
          "value": 4,
          "label": "대부분 (6일)",
          "score": 2
        },
        {
          "responseId": 455,
          "value": 5,
          "label": "거의 매일",
          "score": 1
        }
      ]
    }
  ]
};
