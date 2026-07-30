// PRISM 문항 데이터
// dim: 해당 선택이 +1 되는 차원. layer: L1(입력)/L2(출력)/L3(동력)

const QUESTIONS = {
  "g1": [ // 초1-2, 16문항
    { id: "q1", layer: "L1", text: "영어 단어를 처음 배울 때, 나는...", a: { text: "선생님이 말해주는 걸 듣고 따라 하는 게 좋아", dim: "sound" }, b: { text: "단어를 눈으로 보고 읽는 게 좋아", dim: "text" } },
    { id: "q2", layer: "L1", text: "영어 노래가 나오면 나는...", a: { text: "가사를 안 봐도 소리로 따라 부를 수 있어", dim: "sound" }, b: { text: "가사를 보면서 따라 불러야 해", dim: "text" } },
    { id: "q3", layer: "L1", text: "모르는 영어 단어가 나왔을 때, 나는...", a: { text: "그림이나 상황을 보고 \"아, 이런 뜻이겠다!\" 하고 짐작해", dim: "scene" }, b: { text: "뜻을 찾아보거나 선생님한테 물어봐", dim: "text" } },
    { id: "q4", layer: "L1", text: "영어 만화를 볼 때, 나는...", a: { text: "목소리랑 말소리에 집중해", dim: "sound" }, b: { text: "화면에서 무슨 일이 일어나는지에 집중해", dim: "scene" } },
    { id: "q5", layer: "L1", text: "선생님이 영어로 뭔가 설명해줄 때, 나는...", a: { text: "선생님 표정이랑 몸짓을 보면 이해가 돼", dim: "scene" }, b: { text: "선생님 말소리를 잘 들으면 이해가 돼", dim: "sound" } },
    { id: "q6", layer: "L2", text: "영어로 말할 때, 나는...", a: { text: "틀려도 일단 말해봐", dim: "flow" }, b: { text: "맞는지 생각해보고 말해", dim: "form" } },
    { id: "q7", layer: "L2", text: "영어 시간에 발표하라고 하면, 나는...", a: { text: "바로 손을 들어", dim: "flow" }, b: { text: "머릿속으로 연습하고 나서 손을 들어", dim: "form" } },
    { id: "q8", layer: "L2", text: "배운 적 없는 영어 단어를 써보고 싶을 때, 나는...", a: { text: "일단 써보고 맞는지 나중에 확인해", dim: "frontier" }, b: { text: "맞는 단어인지 먼저 확인하고 써", dim: "form" } },
    { id: "q9", layer: "L2", text: "영어로 글을 쓸 때, 나는...", a: { text: "아는 단어로 빨리 써", dim: "flow" }, b: { text: "새로 배운 단어를 써보려고 노력해", dim: "frontier" } },
    { id: "q10", layer: "L2", text: "영어 수업에서 배운 문장을 바꿔서 나만의 문장을 만들어보는 게...", a: { text: "재미있어! 이것저것 바꿔보고 싶어", dim: "frontier" }, b: { text: "배운 그대로 쓰는 게 더 편하고 좋아", dim: "frontier_low" } },
    { id: "q11", layer: "L3", text: "영어 시간에 새로운 걸 배울 때, 나는...", a: { text: "빨리 해보고 싶어!", dim: "confidence" }, b: { text: "음... 좀 떨려서 망설여져", dim: "confidence_low" } },
    { id: "q12", layer: "L3", text: "외국 사람이 나한테 영어로 말을 걸면...", a: { text: "신나! 대답해보고 싶어", dim: "confidence" }, b: { text: "당황스러워서 입이 잘 안 떨어져", dim: "confidence_low" } },
    { id: "q13", layer: "L3", text: "영어 시간에 대답을 틀렸을 때, 나는...", a: { text: "괜찮아, 바로 다시 해볼 수 있어", dim: "resilience" }, b: { text: "부끄러워서 한동안 손을 못 들겠어", dim: "resilience_low" } },
    { id: "q14", layer: "L3", text: "영어 단어 시험에서 점수가 안 좋으면...", a: { text: "바로 다시 외워볼 거야", dim: "resilience" }, b: { text: "속상해서 한동안 영어 보기가 싫어져", dim: "resilience_low" } },
    { id: "q15", layer: "L3", text: "영어를 배우면 제일 좋은 점은?", a: { text: "외국 친구랑 이야기할 수 있는 거!", dim: "connection" }, b: { text: "영어 시험에서 잘 볼 수 있는 거!", dim: "connection_low" } },
    { id: "q16", layer: "L3", text: "영어로 친구들 앞에서 발표하는 거랑, 선생님이랑 1:1로 이야기하는 거 중에...", a: { text: "친구들 앞에서 발표하는 게 더 좋아", dim: "stage" }, b: { text: "선생님이랑 둘이 이야기하는 게 더 좋아", dim: "stage_low" } }
  ],

  "g2": [ // 초3-4, 24문항
    { id: "q1", layer: "L1", text: "새 영어 단어를 외울 때, 어떤 게 더 잘 외워져?", a: { text: "소리를 여러 번 듣고 따라 말하면 잘 외워져", dim: "sound" }, b: { text: "단어를 노트에 여러 번 쓰면 잘 외워져", dim: "text" } },
    { id: "q2", layer: "L1", text: "영어 리스닝 문제를 풀 때, 나는...", a: { text: "소리만 들어도 대충 무슨 말인지 알겠어", dim: "sound" }, b: { text: "대본(스크립트)을 보면 훨씬 이해가 잘 돼", dim: "text" } },
    { id: "q3", layer: "L1", text: "선생님이 영어 문장을 알려줄 때, 나는...", a: { text: "선생님 발음을 듣고 그대로 따라 하는 게 편해", dim: "sound" }, b: { text: "칠판에 쓰인 문장을 보면서 읽는 게 편해", dim: "text" } },
    { id: "q4", layer: "L1", text: "영어 시간에 모르는 표현이 나오면...", a: { text: "그때 상황이나 그림을 보면서 \"이런 뜻이겠지?\" 하고 추측해", dim: "scene" }, b: { text: "사전을 찾아보거나 선생님한테 바로 물어봐", dim: "text" } },
    { id: "q5", layer: "L1", text: "영어 문법이 헷갈릴 때...", a: { text: "예문을 여러 개 보면서 패턴을 느껴", dim: "scene" }, b: { text: "규칙을 정리해서 외워", dim: "text" } },
    { id: "q6", layer: "L1", text: "영어 영상을 볼 때, 자막 없이도...", a: { text: "목소리 톤이나 말투로 느낌이 와", dim: "sound" }, b: { text: "인물 표정이나 상황으로 느낌이 와", dim: "scene" } },
    { id: "q7", layer: "L1", text: "처음 보는 영어 문장을 만났을 때...", a: { text: "아는 단어 몇 개랑 상황으로 대충 의미를 맞혀봐", dim: "scene" }, b: { text: "모르는 단어의 뜻을 확인하고 넘어가는 게 더 편해", dim: "scene_low" } },
    { id: "q8", layer: "L1", text: "원어민 선생님이 빠르게 말할 때...", a: { text: "전부 못 알아들어도 중요한 단어는 귀에 들어와", dim: "sound" }, b: { text: "천천히 말해주면 더 잘 이해할 수 있어", dim: "sound_low" } },
    { id: "q9", layer: "L2", text: "영어로 말할 때, 나는...", a: { text: "문법이 좀 틀려도 일단 말해봐", dim: "flow" }, b: { text: "문법이 맞는지 확인하고 나서 말해", dim: "form" } },
    { id: "q10", layer: "L2", text: "영어 글쓰기를 할 때, 나는...", a: { text: "일단 많이 쓰고 나중에 고쳐", dim: "flow" }, b: { text: "한 문장씩 맞게 쓰면서 내려가", dim: "form" } },
    { id: "q11", layer: "L2", text: "원어민 선생님이 질문했는데 완벽한 문장이 생각이 안 나면...", a: { text: "단어라도 일단 말해봐", dim: "flow" }, b: { text: "완전한 문장이 생각날 때까지 기다려", dim: "form" } },
    { id: "q12", layer: "L2", text: "영어 일기를 쓸 때, 나는...", a: { text: "배운 적 없는 표현도 일단 써보고 싶어", dim: "frontier" }, b: { text: "확실히 아는 표현만 써", dim: "form" } },
    { id: "q13", layer: "L2", text: "영어 수업에서 자유 대화 시간이 있으면...", a: { text: "새로 배운 단어나 표현을 일부러 써봐", dim: "frontier" }, b: { text: "편하고 익숙한 표현으로 빨리 대화해", dim: "flow" } },
    { id: "q14", layer: "L2", text: "영어 문장을 \"나만의 방식\"으로 바꿔보는 게...", a: { text: "재미있어, 이것저것 바꿔보고 싶어", dim: "frontier" }, b: { text: "원래 문장 그대로 쓰는 게 편해", dim: "frontier_low" } },
    { id: "q15", layer: "L2", text: "영어 수업에서 갑자기 \"이거 영어로 말해볼래?\" 하면...", a: { text: "일단 아는 단어로 바로 말해봐", dim: "flow" }, b: { text: "머릿속으로 문장을 만들어본 다음에 말해", dim: "flow_low" } },
    { id: "q16", layer: "L2", text: "내가 쓴 영어 글에서 빨간 펜 교정이 많으면...", a: { text: "다음에 안 틀리도록 꼼꼼히 봐야지", dim: "form" }, b: { text: "일단 의미가 통했으니까 괜찮아, 다음에 자연스럽게 나아지겠지", dim: "form_low" } },
    { id: "q17", layer: "L3", text: "\"너 영어 잘한다!\"라는 말을 들으면...", a: { text: "맞아, 나 영어 자신 있어", dim: "confidence" }, b: { text: "아니야, 나 잘 못하는데...", dim: "confidence_low" } },
    { id: "q18", layer: "L3", text: "처음 만난 외국인 앞에서 영어로 자기소개를 하라고 하면...", a: { text: "긴장은 되지만 바로 해볼 수 있어", dim: "confidence" }, b: { text: "머릿속이 하얘져서 한마디도 못 할 것 같아", dim: "confidence_low" } },
    { id: "q19", layer: "L3", text: "영어 발표에서 단어가 생각 안 나서 멈췄을 때...", a: { text: "다른 단어로 바꿔서 계속 말해봐", dim: "resilience" }, b: { text: "너무 당황해서 그 자리에서 얼어버려", dim: "resilience_low" } },
    { id: "q20", layer: "L3", text: "영어 시험에서 기대보다 점수가 낮으면...", a: { text: "뭘 틀렸는지 바로 확인하고 다음을 준비해", dim: "resilience" }, b: { text: "속상한 마음이 며칠은 가는 것 같아", dim: "resilience_low" } },
    { id: "q21", layer: "L3", text: "영어를 열심히 하는 가장 큰 이유는?", a: { text: "외국 친구를 사귀거나, 여행할 때 직접 대화하고 싶어서", dim: "connection" }, b: { text: "목표한 성적을 달성하고 싶어서", dim: "connection_low" } },
    { id: "q22", layer: "L3", text: "영어 수업에서 가장 재미있는 순간은?", a: { text: "원어민 선생님이랑 진짜 대화가 될 때", dim: "connection" }, b: { text: "어려운 문제를 맞혔을 때", dim: "connection_low" } },
    { id: "q23", layer: "L3", text: "영어 발표 수업이 있는 날은...", a: { text: "기대돼! 준비한 걸 보여줄 수 있으니까", dim: "stage" }, b: { text: "발표보다는 조별 활동이나 짝 활동이 더 좋아", dim: "stage_low" } },
    { id: "q24", layer: "L3", text: "영어 연극이나 역할극을 하라고 하면...", a: { text: "역할을 맡아서 앞에서 해보고 싶어", dim: "stage" }, b: { text: "대본을 쓰거나 소품을 준비하는 역할이 더 잘 맞아", dim: "stage_low" } }
  ],

  "g3": [ // 초5-6, 30문항
    { id: "q1", layer: "L1", text: "영어 단어를 외울 때 나한테 더 잘 맞는 방법은?", a: { text: "발음을 반복해서 듣고 소리로 기억하는 방법", dim: "sound" }, b: { text: "철자를 눈으로 보면서 손으로 써가며 기억하는 방법", dim: "text" } },
    { id: "q2", layer: "L1", text: "영어 지문을 처음 접할 때...", a: { text: "누군가 읽어주거나 음성으로 들으면 내용이 더 잘 들어와", dim: "sound" }, b: { text: "직접 눈으로 읽는 게 더 빨리 이해돼", dim: "text" } },
    { id: "q3", layer: "L1", text: "원어민 발음이랑 억양을 따라 하는 게...", a: { text: "듣고 그대로 따라 하면 자연스럽게 비슷해져", dim: "sound" }, b: { text: "발음 규칙을 알고 나서 따라 하면 더 정확해져", dim: "text" } },
    { id: "q4", layer: "L1", text: "모르는 영어 표현을 만났을 때 나는 주로...", a: { text: "앞뒤 문맥이나 상황을 단서로 추측해봐", dim: "scene" }, b: { text: "바로 사전이나 번역기를 확인해", dim: "text" } },
    { id: "q5", layer: "L1", text: "영어 문법 규칙을 이해하는 데 더 도움이 되는 건?", a: { text: "다양한 예문을 보면서 \"아, 이런 패턴이구나\" 하고 느끼는 것", dim: "scene" }, b: { text: "규칙을 명확하게 정리해서 공식처럼 외우는 것", dim: "text" } },
    { id: "q6", layer: "L1", text: "자막 없이 영어 영상을 볼 때, 이해에 더 도움이 되는 건?", a: { text: "등장인물의 표정, 몸짓, 상황", dim: "scene" }, b: { text: "말하는 속도, 강세, 톤", dim: "sound" } },
    { id: "q7", layer: "L1", text: "영어 노래를 들으면...", a: { text: "가사가 자연스럽게 귀에 들어와서 따라 부를 수 있어", dim: "sound" }, b: { text: "멜로디는 기억나는데 가사는 잘 안 들려", dim: "sound_low" } },
    { id: "q8", layer: "L1", text: "영어 책을 읽을 때...", a: { text: "모르는 단어가 있어도 문맥으로 짐작하며 계속 읽어 나가", dim: "text" }, b: { text: "모르는 단어를 확인하고 넘어가는 게 더 마음이 편해", dim: "text_low" } },
    { id: "q9", layer: "L1", text: "처음 보는 영어 단어인데 상황을 보고 뜻을 맞힌 경험이...", a: { text: "자주 있어, 맥락을 보면 대충 감이 와", dim: "scene" }, b: { text: "가끔 있지만, 확실한 뜻을 아는 게 더 중요해", dim: "scene_low" } },
    { id: "q10", layer: "L1", text: "영어를 가장 빨리 배울 수 있는 환경은?", a: { text: "영어를 쓰는 나라에서 사람들과 부딪히면서 배우는 것", dim: "scene" }, b: { text: "좋은 교재와 체계적인 커리큘럼으로 배우는 것", dim: "text" } },
    { id: "q11", layer: "L2", text: "영어 말하기에서 나한테 더 가까운 쪽은?", a: { text: "문법이 좀 틀려도 하고 싶은 말을 일단 전달하는 게 중요해", dim: "flow" }, b: { text: "정확한 문장으로 말해야 마음이 편해", dim: "form" } },
    { id: "q12", layer: "L2", text: "영어 에세이를 쓸 때, 나의 습관은?", a: { text: "일단 쭉 쓰고 나중에 한꺼번에 수정해", dim: "flow" }, b: { text: "쓰면서 동시에 문법이나 철자를 계속 확인해", dim: "form" } },
    { id: "q13", layer: "L2", text: "영어 수업 중 선생님이 갑자기 질문을 하면...", a: { text: "바로 뭐라도 대답해봐", dim: "flow" }, b: { text: "머릿속으로 영어 문장을 만들어본 다음에 대답해", dim: "form" } },
    { id: "q14", layer: "L2", text: "영어로 카톡이나 메시지를 보낸다면...", a: { text: "빠르게 짧은 문장으로 여러 번 보내는 스타일", dim: "flow" }, b: { text: "한 번에 완성된 문장으로 깔끔하게 보내는 스타일", dim: "form" } },
    { id: "q15", layer: "L2", text: "영어 글쓰기에서 나는...", a: { text: "최근에 새로 배운 단어나 표현을 일부러 넣어보려고 해", dim: "frontier" }, b: { text: "확실하게 아는 표현 위주로 깔끔하게 써", dim: "form" } },
    { id: "q16", layer: "L2", text: "영어로 자유 대화를 할 때, 나는...", a: { text: "새 표현을 시험해보는 기회로 써", dim: "frontier" }, b: { text: "자연스럽게 흘러가는 대화 자체가 더 중요해", dim: "flow" } },
    { id: "q17", layer: "L2", text: "영어에서 같은 뜻인데 다른 표현이 있으면...", a: { text: "어떤 차이가 있는지 궁금해서 알아봐", dim: "frontier" }, b: { text: "하나만 확실히 알면 되지, 굳이 여러 개를 알 필요 있나?", dim: "frontier_low" } },
    { id: "q18", layer: "L2", text: "영어 수업에서 \"자유 주제로 써보세요\"라고 하면...", a: { text: "배운 것 넘어서 새로운 시도를 해보고 싶어", dim: "frontier" }, b: { text: "뭘 써야 할지 막막해, 주제를 정해줬으면 좋겠어", dim: "frontier_low" } },
    { id: "q19", layer: "L2", text: "말하기 수업에서 나의 영어 발화량은...", a: { text: "틀리든 말든 많이 말하는 편이야", dim: "flow" }, b: { text: "필요할 때만 말하는 편이야", dim: "flow_low" } },
    { id: "q20", layer: "L2", text: "내가 영어로 쓴 글을 다시 읽어볼 때...", a: { text: "거의 항상 문법이나 철자를 다시 체크해", dim: "form" }, b: { text: "의미가 통하면 그대로 내", dim: "form_low" } },
    { id: "q21", layer: "L3", text: "영어 실력에 대한 솔직한 내 생각은?", a: { text: "꾸준히 하면 잘할 수 있다고 생각해", dim: "confidence" }, b: { text: "나는 영어에 약한 것 같아 자신이 없어", dim: "confidence_low" } },
    { id: "q22", layer: "L3", text: "원어민 선생님이 빠르게 말할 때...", a: { text: "못 알아들으면 \"다시 말해주세요\" 하고 바로 물어봐", dim: "confidence" }, b: { text: "못 알아들은 게 들킬까봐 그냥 넘어가", dim: "confidence_low" } },
    { id: "q23", layer: "L3", text: "영어로 전화 통화를 해야 한다면...", a: { text: "긴장은 되지만 해볼 수 있어", dim: "confidence" }, b: { text: "너무 부담스러워서 피하고 싶어", dim: "confidence_low" } },
    { id: "q24", layer: "L3", text: "영어 스피킹에서 말이 막혀서 멈춘 적이 있을 때...", a: { text: "다른 표현으로 돌려서 말해봤어", dim: "resilience" }, b: { text: "당황해서 그 뒤로는 말을 거의 못 했어", dim: "resilience_low" } },
    { id: "q25", layer: "L3", text: "영어 발표에서 실수를 한 경험이 있다면...", a: { text: "다음엔 더 잘 준비하자는 동기가 돼", dim: "resilience" }, b: { text: "그 기억이 한동안 신경 쓰여", dim: "resilience_low" } },
    { id: "q26", layer: "L3", text: "나한테 영어란?", a: { text: "세상 사람들과 소통하는 도구", dim: "connection" }, b: { text: "내 목표를 이루기 위한 중요한 능력", dim: "connection_low" } },
    { id: "q27", layer: "L3", text: "영어를 쓸 때 가장 뿌듯한 순간은?", a: { text: "외국인이랑 진짜 대화가 통했을 때", dim: "connection" }, b: { text: "어려운 영어 과제를 완성했을 때", dim: "connection_low" } },
    { id: "q28", layer: "L3", text: "유튜브나 넷플릭스를 볼 때...", a: { text: "영어 콘텐츠를 자막 없이 보려고 도전한 적 있어", dim: "connection" }, b: { text: "재미있는 콘텐츠가 중요하지, 언어는 상관없어", dim: "connection_low" } },
    { id: "q29", layer: "L3", text: "영어 프레젠테이션 수업에서...", a: { text: "여러 사람 앞에서 내 생각을 발표하는 게 재밌어", dim: "stage" }, b: { text: "소규모로 깊이 있게 토의하는 게 더 잘 맞아", dim: "stage_low" } },
    { id: "q30", layer: "L3", text: "영어 토론이나 디베이트를 하라고 하면...", a: { text: "내 의견을 영어로 표현해보는 도전이 재밌을 것 같아", dim: "stage" }, b: { text: "글로 써서 내 의견을 정리하는 게 더 잘 맞아", dim: "stage_low" } }
  ]
};

const GRADE_GROUP_META = {
  g1: { label: "Level 1", sub: "초1~초2", grades: ["초1", "초2"], time: "5~7분", count: 16 },
  g2: { label: "Level 2", sub: "초3~초4", grades: ["초3", "초4"], time: "8~10분", count: 24 },
  g3: { label: "Level 3", sub: "초5~초6", grades: ["초5", "초6"], time: "10~12분", count: 30 }
};
