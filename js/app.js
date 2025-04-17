document.addEventListener('DOMContentLoaded', function() {
    const todoInput = document.getElementById('todoInput');
    const addTodoBtn = document.getElementById('addTodo');
    const todoList = document.getElementById('todoList');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';
    let notificationInterval;
    
    function init() {
        renderTodos();
        setupEventListeners();
        startNotificationChecker();
    }
    

    function setupEventListeners() {
        if (addTodoBtn) {
            addTodoBtn.addEventListener('click', addTodo);
        }
        
        if (todoInput) {
            todoInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') addTodo();
            });
        }
        
        if (filterButtons) {
            filterButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    filterButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentFilter = btn.dataset.filter;
                    renderTodos();
                });
            });
        }
    }
    

    function startNotificationChecker() {

        if (notificationInterval) {
            clearInterval(notificationInterval);
        }
        
        notificationInterval = setInterval(function() {
            const activeTodos = todos.filter(t => !t.completed);
            const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
            
            if (notificationsEnabled && activeTodos.length > 0 && 
                typeof showNotification === 'function') {
                showNotification(
                    'Незавершенные задачи', 
                    `У вас есть ${activeTodos.length} невыполненных задач`
                );
            }
        }, 10000); // 10 секунд
    }
    

    function addTodo() {
        const text = todoInput.value.trim();
        if (text) {
            const newTodo = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            todos.push(newTodo);
            saveTodos();
            renderTodos();
            todoInput.value = '';
            

            if (localStorage.getItem('notificationsEnabled') !== 'false' && 
                typeof showNotification === 'function') {
            }
        }
    }
    

    function renderTodos() {
        if (!todoList) return;
        
        todoList.innerHTML = '';
        
        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'active') return !todo.completed;
            if (currentFilter === 'completed') return todo.completed;
            return true;
        });
        
        if (filteredTodos.length === 0) {
            todoList.innerHTML = '<li class="empty">Нет задач</li>';
            return;
        }
        
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = todo.completed ? 'completed' : '';
            li.dataset.id = todo.id;
            
            li.innerHTML = `
                <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                <span>${todo.text}</span>
                <button class="delete-btn">×</button>
            `;
            
            const checkbox = li.querySelector('input');
            const deleteBtn = li.querySelector('.delete-btn');
            
            checkbox.addEventListener('change', function() {
                toggleTodo(todo.id);
            });
            
            deleteBtn.addEventListener('click', function() {
                deleteTodo(todo.id);
            });
            
            todoList.appendChild(li);
        });
    }
    

    function toggleTodo(id) {
        todos = todos.map(todo => 
            todo.id === id ? {...todo, completed: !todo.completed} : todo
        );
        saveTodos();
        renderTodos();
    }
    

    function deleteTodo(id) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }
    

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    

    init();
});