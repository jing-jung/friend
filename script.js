(function () {
    var STORAGE_KEY = 'queenquest_progress';

    var state = loadState();

    function loadState() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return {
            currentStage: 0,
            stage1Complete: false,
            stage2Complete: false,
            stage3Complete: false,
            stage4Complete: false,
            stage5Complete: false
        };
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    var introLines = '나의 편지를 받기위해 이정돈 해야지...ㅎㅇㅌ \n너 이거 하는 난이도보고 이후의 편지 난이도 정해진다\n말투는 ai가 해준거임 오해 ㄴㄴ\n고난을 거쳐서 받은 편지 얼마나 짜릿할까';

    function typewriterEffect(element, text, speed) {
        var i = 0;
        element.textContent = '';
        var interval = setInterval(function () {
            if (i < text.length) {
                if (text[i] === '\n') {
                    element.innerHTML += '<br>';
                } else {
                    element.innerHTML += text[i];
                }
                i++;
            } else {
                clearInterval(interval);
            }
        }, speed || 40);
    }

    var introEl = document.getElementById('intro-dialog-text');

    function initGame() {
        if (introEl) {
            typewriterEffect(introEl, introLines, 35);
        }
        if (state.currentStage > 0) {
            startGame();
        } else {
            showScreen('intro-screen');
        }
    }

    var quizData = [
        {
            question: '👑 여왕이 좋아하는 색은?',
            options: ['빨강', '파랑', '노랑', '초록'],
            answer: 2,
            type: 'single'
        },
        {
            question: '👑 여왕은 다음 학기에 휴학한다?',
            options: ['O', 'X'],
            answer: 0,
            type: 'single'
        },
        {
            question: '👑 여왕의 나루토 최애 캐릭터는?',
            options: ['나루토', '사스케', '카카시', '록리'],
            answer: 3,
            type: 'single'
        },
        {
            question: '👑 친구가 내 바지 잡고 넘어졌을 때 내 행동 순서는?',
            options: [
                '친구를 일으켜준다',
                '바지를 올린다',
                '친구를 밟는다',
                '트월킹을 춘다'
            ],
            answer: [1, 2],
            type: 'sequence'
        },
        {
            question: '👑 여왕이 가고 싶은 곳 순서대로 고르시오!',
            options: [
                '캐리비안베이',
                '템플스테이',
                '부산',
                '동묘'
            ],
            answer: [0, 3, 2, 1],
            type: 'sequence'
        }
    ];

    var quizIndex = 0;
    var quizAnswers = [];
    var currentSeqSelection = [];

    var typingTexts = [
        { label: '뮤지컬 웃는 남자', content: '부자들의 낙원은 가난한 자들의 지옥으로 세워진 것이다' },
        { label: '소설 개구리 남자', content: '오늘 개구리를 잡았다 상자에 넣고 이리저리 장난을 쳤다' },
        { label: '노래 가사 1', content: '어느새 훌쩍 커버린 홀로 남은 나 붉어진 두 눈에 맺힌 눈물방울' },
        { label: '노래 가사 2', content: 'Im on the right track baby I was born this way' },
        { label: '노래 가사 3', content: 'Will you still love me when I am no longer young and beautiful' },
        { label: '중학교 교가', content: '' },
        { label: 'IT 개념', content: '운영체제는 하드웨어를 제어하고 자원을 관리하는 시스템 소프트웨어이다 리눅스 파일 시스템은 최상위 루트 디렉토리에서 시작하는 트리 구조를 가진다' }
    ];

    var activeTypingTexts = [];
    var typingIndex = 0;
    var timerInterval = null;
    var timeLeft = 180;

    var detectiveData = [
        {
            question: '한 사람이 대화 중 계속 코를 만지고 있다. 이 행동의 심리적 의미로 가장 적절한 것은?',
            options: [
                '코가 가려워서 무의식적으로 만지는 것이다',
                '거짓말을 하거나 불안함을 느끼고 있다',
                '상대방에게 관심이 없다는 표현이다',
                '깊이 생각하고 있다는 신호이다'
            ],
            answer: 1
        },
        {
            question: '누군가가 대화 중 팔짱을 끼고 있다. 이 행동이 나타내는 심리로 가장 적절한 것은?',
            options: [
                '편안하고 자신감 있는 상태이다',
                '상대방을 존경하는 표현이다',
                '방어적이거나 경계하는 심리 상태이다',
                '단순히 편한 자세를 취하는 것이다'
            ],
            answer: 2
        },
        {
            question: '',
            options: ['', '', '', ''],
            answer: 0
        },
        {
            question: '',
            options: ['', '', '', ''],
            answer: 0
        }
    ];

    var detectiveIndex = 0;
    var detectiveAnswers = [];

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(function (s) {
            s.classList.remove('active');
        });
        var target = document.getElementById(screenId);
        if (target) target.classList.add('active');
        updateProgressBar(screenId);

        var fc = document.getElementById('fireworks-canvas');
        if (screenId === 'stage-5') {
            fc.style.display = 'block';
        } else {
            fc.style.display = 'none';
        }
    }

    function updateProgressBar(screenId) {
        var bar = document.getElementById('progress-bar');
        if (screenId === 'intro-screen') {
            bar.classList.remove('visible');
            return;
        }
        bar.classList.add('visible');

        var stageNum = parseInt(screenId.replace('stage-', ''));
        document.querySelectorAll('.progress-step').forEach(function (step) {
            var s = parseInt(step.dataset.stage);
            step.classList.remove('completed', 'active');
            if (s < stageNum) step.classList.add('completed');
            if (s === stageNum) step.classList.add('active');
        });
        document.querySelectorAll('.progress-connector').forEach(function (line) {
            var l = parseInt(line.dataset.line);
            if (l < stageNum) {
                line.classList.add('filled');
            } else {
                line.classList.remove('filled');
            }
        });
    }

    window.startGame = function () {
        if (state.stage5Complete) {
            state.currentStage = 5;
            showScreen('stage-5');
            initFireworks();
            saveState();
            return;
        }
        if (state.stage4Complete) {
            state.currentStage = 5;
            showScreen('stage-5');
            initFireworks();
        } else if (state.stage3Complete) {
            state.currentStage = 4;
            showScreen('stage-4');
            initDetective();
        } else if (state.stage2Complete) {
            state.currentStage = 3;
            showScreen('stage-3');
            initTyping();
        } else if (state.stage1Complete) {
            state.currentStage = 2;
            showScreen('stage-2');
            initSudoku();
        } else {
            state.currentStage = 1;
            showScreen('stage-1');
            initQuiz();
        }
        saveState();
    };

    function initQuiz() {
        quizIndex = 0;
        quizAnswers = [];
        currentSeqSelection = [];
        document.getElementById('quiz-result').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        renderQuizQuestion();
    }

    function renderQuizQuestion() {
        var q = quizData[quizIndex];
        var container = document.getElementById('quiz-container');
        document.getElementById('quiz-current').textContent = quizIndex + 1;
        currentSeqSelection = [];

        var optionsHTML = '';
        if (q.type === 'sequence') {
            optionsHTML += '<div class="order-instruction">순서대로 터치하여 고르시오!</div>';
            optionsHTML += '<div class="order-grid">';
            q.options.forEach(function (opt, i) {
                optionsHTML +=
                    '<div class="order-item" data-index="' + i + '" onclick="selectSequenceOption(this)">' +
                    '<div class="order-number"></div>' +
                    '<div class="order-text">' + opt + '</div>' +
                    '</div>';
            });
            optionsHTML += '</div>';
        } else {
            var markers = ['A', 'B', 'C', 'D'];
            optionsHTML += '<div class="quiz-options">';
            q.options.forEach(function (opt, i) {
                optionsHTML +=
                    '<div class="quiz-option" data-index="' + i + '" onclick="selectQuizOption(this)">' +
                    '<div class="option-marker">' + markers[i] + '</div>' +
                    '<span>' + opt + '</span>' +
                    '</div>';
            });
            optionsHTML += '</div>';
        }

        container.innerHTML =
            '<div class="quiz-question">' + q.question + '</div>' +
            optionsHTML +
            '<div class="quiz-btn-row">';

        if (q.type === 'sequence') {
            container.innerHTML +=
                '<button class="pixel-btn pixel-btn-danger" style="margin-right:auto;" onclick="resetSequenceSelection()">🔄 초기화</button>';
        }

        container.innerHTML +=
            '<button class="pixel-btn pixel-btn-primary" onclick="submitQuizAnswer()">' +
            (quizIndex < quizData.length - 1 ? '▶ 다음 문제' : '✔ 결과 확인') +
            '</button>' +
            '</div>';
    }

    window.selectQuizOption = function (el) {
        el.closest('.quiz-options').querySelectorAll('.quiz-option').forEach(function (o) {
            o.classList.remove('selected');
        });
        el.classList.add('selected');
    };

    window.selectSequenceOption = function (el) {
        var idx = parseInt(el.dataset.index);
        var alreadyIdx = currentSeqSelection.indexOf(idx);
        if (alreadyIdx !== -1) {
            currentSeqSelection.splice(alreadyIdx, 1);
            el.classList.remove('selected');
            el.querySelector('.order-number').textContent = '';
            var grid = el.closest('.order-grid');
            currentSeqSelection.forEach(function (selectedId, sOrder) {
                var item = grid.querySelector('.order-item[data-index="' + selectedId + '"]');
                if (item) item.querySelector('.order-number').textContent = sOrder + 1;
            });
        } else {
            currentSeqSelection.push(idx);
            el.classList.add('selected');
            el.querySelector('.order-number').textContent = currentSeqSelection.length;
        }
    };

    window.resetSequenceSelection = function () {
        currentSeqSelection = [];
        document.querySelectorAll('.order-grid .order-item').forEach(function (el) {
            el.classList.remove('selected');
            el.querySelector('.order-number').textContent = '';
        });
    };

    window.submitQuizAnswer = function () {
        var q = quizData[quizIndex];
        if (q.type === 'sequence') {
            if (currentSeqSelection.length === 0) {
                var container = document.getElementById('quiz-container');
                container.style.animation = 'shake 0.4s ease';
                setTimeout(function () { container.style.animation = ''; }, 400);
                return;
            }
            quizAnswers.push(JSON.parse(JSON.stringify(currentSeqSelection)));
        } else {
            var selected = document.querySelector('#quiz-container .quiz-option.selected');
            if (!selected) {
                var container = document.getElementById('quiz-container');
                container.style.animation = 'shake 0.4s ease';
                setTimeout(function () { container.style.animation = ''; }, 400);
                return;
            }
            quizAnswers.push(parseInt(selected.dataset.index));
        }

        quizIndex++;

        if (quizIndex < quizData.length) {
            renderQuizQuestion();
        } else {
            showQuizResult();
        }
    };

    function showQuizResult() {
        document.getElementById('quiz-container').style.display = 'none';
        var resultDiv = document.getElementById('quiz-result');
        resultDiv.style.display = 'block';

        var correctCount = 0;
        quizAnswers.forEach(function (ans, i) {
            var q = quizData[i];
            if (q.type === 'sequence') {
                if (Array.isArray(ans) && Array.isArray(q.answer) && ans.length === q.answer.length) {
                    var correct = true;
                    for (var idx = 0; idx < ans.length; idx++) {
                        if (ans[idx] !== q.answer[idx]) correct = false;
                    }
                    if (correct) correctCount++;
                }
            } else {
                if (ans === q.answer) correctCount++;
            }
        });

        var passed = correctCount === quizData.length;
        var content = document.getElementById('quiz-result-content');

        if (passed) {
            content.innerHTML =
                '<div class="result-icon">🎉</div>' +
                '<div class="result-title success">QUEST CLEAR!</div>' +
                '<div class="result-score">' + correctCount + ' / ' + quizData.length + '</div>' +
                '<div class="result-message">👑 여왕 : "호오... 제법이구나!<br>다음 시련으로 나아가거라!"</div>' +
                '<div class="result-btn-row">' +
                '<button class="pixel-btn pixel-btn-primary" onclick="goToStage2()">▶ 다음 시련으로</button>' +
                '</div>';
        } else {
            content.innerHTML =
                '<div class="result-icon">😤</div>' +
                '<div class="result-title fail">QUEST FAILED</div>' +
                '<div class="result-score">' + correctCount + ' / ' + quizData.length + '</div>' +
                '<div class="result-message">👑 여왕 : "부족하구나!<br>5문제를 모두 맞춰야 통과할 수 있느니라!"</div>' +
                '<div class="result-btn-row">' +
                '<button class="pixel-btn pixel-btn-danger" onclick="retryQuiz()">🔄 다시 도전</button>' +
                '</div>';
        }
    }

    window.retryQuiz = function () {
        initQuiz();
    };

    window.goToStage2 = function () {
        state.stage1Complete = true;
        state.currentStage = 2;
        saveState();
        showScreen('stage-2');
        initSudoku();
    };

    window.completeStage2 = function () {
        if (!checkSudokuSolved()) {
            var msg = document.getElementById('sudoku-message');
            msg.textContent = '❌ 아직 금고의 암호가 맞지 않느니라! 빈칸이 있거나 틀린 숫자가 있도다!';
            msg.style.display = 'block';
            msg.style.color = 'var(--incorrect-red)';
            setTimeout(function () { msg.style.display = 'none'; }, 3000);
            return;
        }
        state.stage2Complete = true;
        state.currentStage = 3;
        saveState();
        showStageClear(2, function () {
            showScreen('stage-3');
            initTyping();
        });
    };

    var sudokuBoard = [];
    var sudokuSolution = [];
    var sudokuMemos = [];
    var selectedCell = null;
    var isMemoMode = false;
    var hintsLeft = 3;

    function initSudoku() {
        hintsLeft = 3;
        selectedCell = null;
        isMemoMode = false;
        document.getElementById('hints-left').textContent = hintsLeft;
        document.getElementById('memo-btn').classList.remove('active');
        document.getElementById('sudoku-message').style.display = 'none';

        var solution = [
            [5, 3, 4, 6, 7, 8, 9, 1, 2],
            [6, 7, 2, 1, 9, 5, 3, 4, 8],
            [1, 9, 8, 3, 4, 2, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3],
            [4, 2, 6, 8, 5, 3, 7, 9, 1],
            [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4],
            [2, 8, 7, 4, 1, 9, 6, 3, 5],
            [3, 4, 5, 2, 8, 6, 1, 7, 9]
        ];

        var puzzle = [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ];

        sudokuSolution = solution;
        sudokuBoard = JSON.parse(JSON.stringify(puzzle));
        sudokuMemos = Array.from({ length: 81 }, function () { return []; });

        renderSudokuBoard();
        renderSudokuNumpad();
    }

    function renderSudokuBoard() {
        var boardDiv = document.getElementById('sudoku-board');
        boardDiv.innerHTML = '';
        for (var r = 0; r < 9; r++) {
            for (var c = 0; c < 9; c++) {
                var cellVal = sudokuBoard[r][c];
                var cellIndex = r * 9 + c;
                var cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                if (c === 3 || c === 6) cell.classList.add('bl');
                if (r === 3 || r === 6) cell.classList.add('bt');

                if (cellVal !== 0) {
                    cell.textContent = cellVal;
                    if (cellVal === sudokuSolution[r][c] && (r * 9 + c === 2 || r * 9 + c === 5 || r * 9 + c === 8 || r * 9 + c === 10 || r * 9 + c === 14 || r * 9 + c === 15 || r * 9 + c === 16 || r * 9 + c === 17 || r * 9 + c === 18 || r * 9 + c === 21 || r * 9 + c === 22 || r * 9 + c === 23 || r * 9 + c === 24 || r * 9 + c === 25 || r * 9 + c === 26 || r * 9 + c === 27 || r * 9 + c === 28 || r * 9 + c === 29 || r * 9 + c === 30 || r * 9 + c === 31 || r * 9 + c === 32 || r * 9 + c === 33 || r * 9 + c === 34 || r * 9 + c === 35 || r * 9 + c === 36 || r * 9 + c === 37 || r * 9 + c === 38 || r * 9 + c === 39 || r * 9 + c === 40 || r * 9 + c === 41 || r * 9 + c === 42 || r * 9 + c === 43 || r * 9 + c === 44 || r * 9 + c === 45 || r * 9 + c === 46 || r * 9 + c === 47 || r * 9 + c === 48 || r * 9 + c === 49 || r * 9 + c === 50 || r * 9 + c === 51 || r * 9 + c === 52 || r * 9 + c === 53 || r * 9 + c === 54 || r * 9 + c === 55 || r * 9 + c === 56 || r * 9 + c === 57 || r * 9 + c === 58 || r * 9 + c === 59 || r * 9 + c === 60 || r * 9 + c === 61 || r * 9 + c === 62 || r * 9 + c === 63 || r * 9 + c === 64 || r * 9 + c === 65 || r * 9 + c === 66 || r * 9 + c === 67 || r * 9 + c === 68 || r * 9 + c === 69 || r * 9 + c === 70 || r * 9 + c === 71 || r * 9 + c === 72 || r * 9 + c === 73 || r * 9 + c === 74 || r * 9 + c === 75 || r * 9 + c === 76 || r * 9 + c === 77 || r * 9 + c === 78 || r * 9 + c === 79 || r * 9 + c === 80)) {
                        cell.classList.add('filled');
                    } else {
                        cell.classList.add('given');
                    }
                } else {
                    var cellMemos = sudokuMemos[cellIndex];
                    if (cellMemos.length > 0) {
                        var grid = document.createElement('div');
                        grid.className = 'cell-memos';
                        for (var m = 1; m <= 9; m++) {
                            var memoSpan = document.createElement('div');
                            memoSpan.className = 'memo-n';
                            if (cellMemos.indexOf(m) !== -1) memoSpan.textContent = m;
                            grid.appendChild(memoSpan);
                        }
                        cell.appendChild(grid);
                    }
                }

                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', function () {
                    selectSudokuCell(this);
                });
                boardDiv.appendChild(cell);
            }
        }
    }

    function renderSudokuNumpad() {
        var pad = document.getElementById('sudoku-numpad');
        pad.innerHTML = '';
        for (var i = 1; i <= 9; i++) {
            var btn = document.createElement('button');
            btn.className = 'numpad-btn';
            btn.textContent = i;
            btn.dataset.num = i;
            btn.addEventListener('click', function () {
                inputSudokuNumber(parseInt(this.dataset.num));
            });
            pad.appendChild(btn);
        }
    }

    function selectSudokuCell(cell) {
        document.querySelectorAll('.sudoku-cell').forEach(function (c) {
            c.classList.remove('selected', 'highlighted', 'same-num');
        });
        cell.classList.add('selected');
        selectedCell = cell;

        var r = parseInt(cell.dataset.row);
        var c = parseInt(cell.dataset.col);
        var cellVal = sudokuBoard[r][c];

        document.querySelectorAll('.sudoku-cell').forEach(function (cellEl) {
            var elR = parseInt(cellEl.dataset.row);
            var elC = parseInt(cellEl.dataset.col);
            if (elR === r || elC === c) {
                cellEl.classList.add('highlighted');
            }
            if (cellVal !== 0 && sudokuBoard[elR][elC] === cellVal) {
                cellEl.classList.add('same-num');
            }
        });
    }

    function inputSudokuNumber(num) {
        if (!selectedCell) return;
        var r = parseInt(selectedCell.dataset.row);
        var c = parseInt(selectedCell.dataset.col);
        var cellIndex = r * 9 + c;

        var isGiven = [
            [true, true, false, false, true, false, false, false, false],
            [true, false, false, true, true, true, false, false, false],
            [false, true, true, false, false, false, false, true, false],
            [true, false, false, false, true, false, false, false, true],
            [true, false, false, true, false, true, false, false, true],
            [true, false, false, false, true, false, false, false, true],
            [false, true, false, false, false, false, true, true, false],
            [false, false, false, true, true, true, false, false, true],
            [false, false, false, false, true, false, false, true, true]
        ];

        if (isGiven[r][c]) return;

        if (isMemoMode) {
            sudokuBoard[r][c] = 0;
            var idx = sudokuMemos[cellIndex].indexOf(num);
            if (idx === -1) {
                sudokuMemos[cellIndex].push(num);
            } else {
                sudokuMemos[cellIndex].splice(idx, 1);
            }
        } else {
            sudokuMemos[cellIndex] = [];
            sudokuBoard[r][c] = num;
        }

        renderSudokuBoard();
        var targetCell = document.querySelector('.sudoku-cell[data-row="' + r + '"][data-col="' + c + '"]');
        if (targetCell) selectSudokuCell(targetCell);
    }

    window.toggleMemo = function () {
        isMemoMode = !isMemoMode;
        var btn = document.getElementById('memo-btn');
        if (isMemoMode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    };

    window.eraseCell = function () {
        if (!selectedCell) return;
        var r = parseInt(selectedCell.dataset.row);
        var c = parseInt(selectedCell.dataset.col);
        var cellIndex = r * 9 + c;

        var isGiven = [
            [true, true, false, false, true, false, false, false, false],
            [true, false, false, true, true, true, false, false, false],
            [false, true, true, false, false, false, false, true, false],
            [true, false, false, false, true, false, false, false, true],
            [true, false, false, true, false, true, false, false, true],
            [true, false, false, false, true, false, false, false, true],
            [false, true, false, false, false, false, true, true, false],
            [false, false, false, true, true, true, false, false, true],
            [false, false, false, false, true, false, false, true, true]
        ];

        if (isGiven[r][c]) return;

        sudokuBoard[r][c] = 0;
        sudokuMemos[cellIndex] = [];
        renderSudokuBoard();
        var targetCell = document.querySelector('.sudoku-cell[data-row="' + r + '"][data-col="' + c + '"]');
        if (targetCell) selectSudokuCell(targetCell);
    };

    window.useHint = function () {
        if (hintsLeft <= 0) return;
        if (!selectedCell) return;
        var r = parseInt(selectedCell.dataset.row);
        var c = parseInt(selectedCell.dataset.col);
        var cellIndex = r * 9 + c;

        var isGiven = [
            [true, true, false, false, true, false, false, false, false],
            [true, false, false, true, true, true, false, false, false],
            [false, true, true, false, false, false, false, true, false],
            [true, false, false, false, true, false, false, false, true],
            [true, false, false, true, false, true, false, false, true],
            [true, false, false, false, true, false, false, false, true],
            [false, true, false, false, false, false, true, true, false],
            [false, false, false, true, true, true, false, false, true],
            [false, false, false, false, true, false, false, true, true]
        ];

        if (isGiven[r][c]) return;

        sudokuBoard[r][c] = sudokuSolution[r][c];
        sudokuMemos[cellIndex] = [];
        hintsLeft--;
        document.getElementById('hints-left').textContent = hintsLeft;

        renderSudokuBoard();
        var targetCell = document.querySelector('.sudoku-cell[data-row="' + r + '"][data-col="' + c + '"]');
        if (targetCell) selectSudokuCell(targetCell);
    };

    function checkSudokuSolved() {
        for (var r = 0; r < 9; r++) {
            for (var c = 0; c < 9; c++) {
                if (sudokuBoard[r][c] !== sudokuSolution[r][c]) return false;
            }
        }
        return true;
    }

    function showStageClear(stageNum, callback) {
        var overlay = document.createElement('div');
        overlay.className = 'stage-clear-overlay';
        overlay.innerHTML =
            '<div class="stage-clear-card">' +
            '<div class="clear-icon">⭐</div>' +
            '<div class="clear-title">STAGE ' + stageNum + ' CLEAR!</div>' +
            '<div class="clear-dialog">👑 여왕 : "훌륭하구나!<br>다음 방으로 이동하여라!"</div>' +
            '<button class="pixel-btn pixel-btn-primary" id="clear-continue-btn">▶ 계속하기</button>' +
            '</div>';
        document.body.appendChild(overlay);

        document.getElementById('clear-continue-btn').addEventListener('click', function () {
            overlay.remove();
            if (callback) callback();
        });
    }

    function initTyping() {
        activeTypingTexts = typingTexts.filter(function (t) { return t.content.length > 0; });
        typingIndex = 0;
        timeLeft = 180;

        document.getElementById('typing-total').textContent = activeTypingTexts.length;
        document.getElementById('typing-result').style.display = 'none';
        document.getElementById('typing-panel').style.display = 'block';
        document.querySelector('.typing-status-bar').style.display = 'flex';

        renderTypingText();
        startTimer();
    }

    function renderTypingText() {
        if (typingIndex >= activeTypingTexts.length) {
            typingSuccess();
            return;
        }

        var current = activeTypingTexts[typingIndex];
        document.getElementById('typing-current').textContent = typingIndex + 1;
        document.getElementById('typing-label').textContent = '📜 ' + current.label;

        var display = document.getElementById('typing-display');
        var html = '';
        for (var i = 0; i < current.content.length; i++) {
            var ch = current.content[i];
            var cls = i === 0 ? 'char current' : 'char pending';
            html += '<span class="' + cls + '">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>';
        }
        display.innerHTML = html;

        var input = document.getElementById('typing-input');
        input.value = '';
        input.disabled = false;
        input.focus();
    }

    document.getElementById('typing-input').addEventListener('input', function () {
        if (typingIndex >= activeTypingTexts.length) return;
        var current = activeTypingTexts[typingIndex];
        var typed = this.value;
        var chars = document.querySelectorAll('#typing-display .char');

        for (var i = 0; i < current.content.length; i++) {
            chars[i].className = 'char';
            if (i < typed.length) {
                if (typed[i] === current.content[i]) {
                    chars[i].classList.add('correct');
                } else {
                    chars[i].classList.add('incorrect');
                }
            } else if (i === typed.length) {
                chars[i].classList.add('current');
            } else {
                chars[i].classList.add('pending');
            }
        }

        if (typed === current.content) {
            typingIndex++;
            if (typingIndex < activeTypingTexts.length) {
                setTimeout(renderTypingText, 300);
            } else {
                typingSuccess();
            }
        }
    });

    function startTimer() {
        updateTimerDisplay();
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(function () {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                typingFail();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        var mins = Math.floor(timeLeft / 60);
        var secs = timeLeft % 60;
        var display = document.getElementById('timer-value');
        display.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;

        var timerBox = display.closest('.timer-box');
        timerBox.classList.remove('warning', 'danger');
        if (timeLeft <= 30) {
            timerBox.classList.add('danger');
        } else if (timeLeft <= 60) {
            timerBox.classList.add('warning');
        }
    }

    function typingSuccess() {
        clearInterval(timerInterval);
        document.getElementById('typing-panel').style.display = 'none';
        document.querySelector('.typing-status-bar').style.display = 'none';
        var resultDiv = document.getElementById('typing-result');
        resultDiv.style.display = 'block';

        var elapsed = 180 - timeLeft;
        var mins = Math.floor(elapsed / 60);
        var secs = elapsed % 60;

        document.getElementById('typing-result-content').innerHTML =
            '<div class="result-icon">📜</div>' +
            '<div class="result-title success">QUEST CLEAR!</div>' +
            '<div class="result-score">' + mins + '분 ' + secs + '초</div>' +
            '<div class="result-message">👑 여왕 : "정확한 필사이구나!<br>다음 시련으로 나아가거라!"</div>' +
            '<div class="result-btn-row">' +
            '<button class="pixel-btn pixel-btn-primary" onclick="goToStage4()">▶ 다음 시련으로</button>' +
            '</div>';

        document.getElementById('typing-input').disabled = true;
    }

    function typingFail() {
        clearInterval(timerInterval);
        document.getElementById('typing-panel').style.display = 'none';
        document.querySelector('.typing-status-bar').style.display = 'none';
        var resultDiv = document.getElementById('typing-result');
        resultDiv.style.display = 'block';

        document.getElementById('typing-result-content').innerHTML =
            '<div class="result-icon">⏰</div>' +
            '<div class="result-title fail">TIME OVER</div>' +
            '<div class="result-score">0:00</div>' +
            '<div class="result-message">👑 여왕 : "시간이 초과되었느니라!<br>다시 도전하여라!"</div>' +
            '<div class="result-btn-row">' +
            '<button class="pixel-btn pixel-btn-danger" onclick="retryTyping()">🔄 다시 도전</button>' +
            '</div>';

        document.getElementById('typing-input').disabled = true;
    }

    window.retryTyping = function () {
        initTyping();
    };

    window.goToStage4 = function () {
        state.stage3Complete = true;
        state.currentStage = 4;
        saveState();
        showScreen('stage-4');
        initDetective();
    };

    function initDetective() {
        var activeDetective = detectiveData.filter(function (d) { return d.question.length > 0; });
        detectiveIndex = 0;
        detectiveAnswers = [];

        document.getElementById('detective-total').textContent = activeDetective.length;
        document.getElementById('detective-result').style.display = 'none';
        document.getElementById('detective-container').style.display = 'block';

        window._activeDetective = activeDetective;
        renderDetectiveQuestion();
    }

    function renderDetectiveQuestion() {
        var questions = window._activeDetective;
        if (detectiveIndex >= questions.length) {
            showDetectiveResult();
            return;
        }

        var q = questions[detectiveIndex];
        var container = document.getElementById('detective-container');
        document.getElementById('detective-current').textContent = detectiveIndex + 1;

        var markers = ['A', 'B', 'C', 'D'];
        var optionsHTML = '<div class="quiz-options">';
        q.options.forEach(function (opt, i) {
            if (opt.length === 0) return;
            optionsHTML +=
                '<div class="quiz-option" data-index="' + i + '" onclick="selectDetectiveOption(this)">' +
                '<div class="option-marker">' + markers[i] + '</div>' +
                '<span>' + opt + '</span>' +
                '</div>';
        });
        optionsHTML += '</div>';

        container.innerHTML =
            '<div class="quiz-question">🔮 ' + q.question + '</div>' +
            optionsHTML +
            '<div class="quiz-btn-row">' +
            '<button class="pixel-btn pixel-btn-primary" onclick="submitDetectiveAnswer()">' +
            (detectiveIndex < questions.length - 1 ? '▶ 다음 문제' : '✔ 결과 확인') +
            '</button>' +
            '</div>';
    }

    window.selectDetectiveOption = function (el) {
        el.closest('.quiz-options').querySelectorAll('.quiz-option').forEach(function (o) {
            o.classList.remove('selected');
        });
        el.classList.add('selected');
    };

    window.submitDetectiveAnswer = function () {
        var selected = document.querySelector('#detective-container .quiz-option.selected');
        if (!selected) {
            var container = document.getElementById('detective-container');
            container.style.animation = 'shake 0.4s ease';
            setTimeout(function () { container.style.animation = ''; }, 400);
            return;
        }

        detectiveAnswers.push(parseInt(selected.dataset.index));
        detectiveIndex++;

        var questions = window._activeDetective;
        if (detectiveIndex < questions.length) {
            renderDetectiveQuestion();
        } else {
            showDetectiveResult();
        }
    };

    function showDetectiveResult() {
        document.getElementById('detective-container').style.display = 'none';
        var resultDiv = document.getElementById('detective-result');
        resultDiv.style.display = 'block';

        var questions = window._activeDetective;
        var correctCount = 0;
        detectiveAnswers.forEach(function (ans, i) {
            if (ans === questions[i].answer) correctCount++;
        });

        var passed = correctCount === questions.length;

        if (passed) {
            document.getElementById('detective-result-content').innerHTML =
                '<div class="result-icon">🔮</div>' +
                '<div class="result-title success">QUEST CLEAR!</div>' +
                '<div class="result-score">' + correctCount + ' / ' + questions.length + '</div>' +
                '<div class="result-message">👑 여왕 : "대단하구나!<br>마지막 방으로 나아가거라!"</div>' +
                '<div class="result-btn-row">' +
                '<button class="pixel-btn pixel-btn-primary" onclick="goToStage5()">🎁 마지막 방으로</button>' +
                '</div>';
        } else {
            document.getElementById('detective-result-content').innerHTML =
                '<div class="result-icon">🤔</div>' +
                '<div class="result-title fail">QUEST FAILED</div>' +
                '<div class="result-score">' + correctCount + ' / ' + questions.length + '</div>' +
                '<div class="result-message">👑 여왕 : "아직 부족하구나!<br>모든 문제를 맞춰야 통과할 수 있느니라!"</div>' +
                '<div class="result-btn-row">' +
                '<button class="pixel-btn pixel-btn-danger" onclick="retryDetective()">🔄 다시 도전</button>' +
                '</div>';
        }
    }

    window.retryDetective = function () {
        initDetective();
    };

    window.goToStage5 = function () {
        state.stage4Complete = true;
        state.stage5Complete = true;
        state.currentStage = 5;
        saveState();
        showScreen('stage-5');
        initFireworks();
    };

    var fireworksCanvas, fireworksCtx, fireworksParticles, fireworksAnimId, fireworksLaunchInterval;

    function initFireworks() {
        fireworksCanvas = document.getElementById('fireworks-canvas');
        fireworksCtx = fireworksCanvas.getContext('2d');
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
        fireworksParticles = [];

        window.addEventListener('resize', function () {
            if (fireworksCanvas) {
                fireworksCanvas.width = window.innerWidth;
                fireworksCanvas.height = window.innerHeight;
            }
        });

        launchPixelFirework();
        fireworksLaunchInterval = setInterval(launchPixelFirework, 900);
        animateFireworks();
    }

    function launchPixelFirework() {
        if (!fireworksCanvas) return;
        var x = Math.random() * fireworksCanvas.width;
        var y = Math.random() * fireworksCanvas.height * 0.5;
        var colors = [
            '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
            '#9C27B0', '#FF9800', '#E91E63', '#00BCD4'
        ];
        var color = colors[Math.floor(Math.random() * colors.length)];
        var count = 30 + Math.floor(Math.random() * 20);

        for (var i = 0; i < count; i++) {
            var angle = (Math.PI * 2 / count) * i;
            var speed = 1.5 + Math.random() * 3.5;
            fireworksParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.01 + Math.random() * 0.015,
                color: color,
                size: 3 + Math.floor(Math.random() * 3)
            });
        }
    }

    function animateFireworks() {
        fireworksCtx.fillStyle = 'rgba(135, 206, 235, 0.2)';
        fireworksCtx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

        fireworksParticles.forEach(function (p) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.03;
            p.vx *= 0.99;
            p.life -= p.decay;

            fireworksCtx.globalAlpha = p.life;
            fireworksCtx.fillStyle = p.color;
            fireworksCtx.fillRect(
                Math.floor(p.x),
                Math.floor(p.y),
                p.size,
                p.size
            );
            fireworksCtx.globalAlpha = 1;
        });

        fireworksParticles = fireworksParticles.filter(function (p) { return p.life > 0; });
        fireworksAnimId = requestAnimationFrame(animateFireworks);
    }

    window.resetGame = function () {
        localStorage.removeItem(STORAGE_KEY);
        if (timerInterval) clearInterval(timerInterval);
        if (fireworksAnimId) cancelAnimationFrame(fireworksAnimId);
        if (fireworksLaunchInterval) clearInterval(fireworksLaunchInterval);

        state.currentStage = 0;
        state.stage1Complete = false;
        state.stage2Complete = false;
        state.stage3Complete = false;
        state.stage4Complete = false;
        state.stage5Complete = false;

        var fc = document.getElementById('fireworks-canvas');
        fc.style.display = 'none';
        var ctx = fc.getContext('2d');
        ctx.clearRect(0, 0, fc.width, fc.height);

        showScreen('intro-screen');
        if (introEl) {
            typewriterEffect(introEl, introLines, 35);
        }
    };

    window.verifyGatePass = function () {
        var input = document.getElementById('gate-pass-input').value.trim();
        var error = document.getElementById('gate-error');
        var actualPassword = (typeof GAME_PASSWORD !== 'undefined') ? String(GAME_PASSWORD).trim() : '';

        if (input === actualPassword) {
            document.getElementById('gate-screen').style.display = 'none';
            initGame();
        } else {
            error.textContent = '❌ 암호가 틀렸노라! 올바른 비밀번호를 입력하여라!';
            var card = document.querySelector('.gate-card');
            card.style.animation = 'shake 0.4s ease';
            setTimeout(function () { card.style.animation = ''; }, 400);
        }
    };

    document.getElementById('gate-pass-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            verifyGatePass();
        }
    });

    window.addEventListener('DOMContentLoaded', function () {
        var actualPassword = (typeof GAME_PASSWORD !== 'undefined') ? GAME_PASSWORD : '';
        if (!actualPassword) {
            document.getElementById('gate-screen').style.display = 'none';
            initGame();
        }
    });
})();
