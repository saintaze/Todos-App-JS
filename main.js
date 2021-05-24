// Class

class Todo {
  constructor(body) {
    this.body = body;
		this.completed = false;
    this.date = Date.now();
		this.id = generateId();
  }
}

//  State 

const state = {
	todos: [],
	todosToShow: [],
	checkAllTodos: false,
	activeViewMode: 'ALL',
	pagination: {
		currentPage: 1,
		todosPerPage: 3,
		maxPages: 3,
		currentPageGroup: 1
	}
}

// Selectors

const todoAddBtn = document.querySelector('.new-todo-box button');
const newTodoInput = document.querySelector('.new-todo-box input');
const todoSearchBtn = document.querySelector('.search-todo-box button');
const searchTodoInput = document.querySelector('.search-todo-box input');
const toggleCheckAllBtn = document.querySelector('.check-all');
const deleteAllBtn = document.querySelector('.delete-all');
const showActiveBtn = document.querySelector('.active');
const showCompletedBtn = document.querySelector('.completed');
const showAllBtn = document.querySelector('.all');
const mainEl = document.querySelector('main');
const todoActionsEl = document.querySelector('.todo-actions');
const searchTodoBoxEl = document.querySelector('.search-todo-box');
const addTodosMessageEl = document.querySelector('.add-todos-message');
const todosListEl = document.querySelector('.todos-list');
const paginationContainerEl = document.querySelector('.pagination-container');
const paginationStatsEl = document.querySelector('.pagination-stats');
const noResultsEl = document.querySelector('.no-results');

// Registering Listeners

todoAddBtn.addEventListener('click', createNewTodo);
todoSearchBtn.addEventListener('click', searchTodos);
toggleCheckAllBtn.addEventListener('click', toggleCheckAllTodos);
deleteAllBtn.addEventListener('click', deleteAllTodos);
showActiveBtn.addEventListener('click', showActiveTodos);
showCompletedBtn.addEventListener('click', showCompletedTodos);
showAllBtn.addEventListener('click', showAllTodos);
newTodoInput.addEventListener('keyup', e => {if (e.key === "Enter") createNewTodo() });
searchTodoInput.addEventListener('keyup', e => {if (e.key === "Enter") searchTodos() });

// Functions 

// function
function dec2hex (dec) {
  return dec.toString(16).padStart(2, "0");
}

// function
function generateId () {
  var arr = new Uint8Array(40 / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join('');
}

// function
function clearInputs(){
	searchTodoInput.value = '';
	newTodoInput.value = '';
}

// function
function toggleActiveView(){
	document.querySelectorAll('.todo-actions button').forEach(viewBtn => {
		if(viewBtn.textContent.toUpperCase() === state.activeViewMode){
			viewBtn.classList.add('active');
		}else{
			viewBtn.classList.remove('active');
		}
	});
}

// function
function renderTodos (todos) {
	showMessageOrTodos();
	toggleActiveView();
	todosListEl.innerHTML = '';
	const paginatedTodos = createPaginatedTodos(todos);
	paginatedTodos.forEach(todo => {
		const todoEl = createTodo(todo);
		todosListEl.appendChild(todoEl);
	});
	togglePaginationDisplay(todos);
}

// function
function togglePaginationDisplay(todos){
	if(todos.length){
		paginationContainerEl.style.display = 'flex';
		noResultsEl.style.display = 'none';
		renderPagination();
	}else{
		paginationContainerEl.style.display = 'none';
		noResultsEl.style.display = 'block';
	}
}

// function
function createPaginatedTodos(todos){
	const skip = (state.pagination.currentPage - 1) * state.pagination.todosPerPage;
	const paginatedTodos = todos.slice(skip, skip + state.pagination.todosPerPage);
	paginationStatsEl.textContent = `${skip + 1}-${skip + state.pagination.todosPerPage}  of ${state.todosToShow.length}`;
	return paginatedTodos;
}

// function
function createTodo(todo){
	const todoEl = document.createElement('div');
	const checkBoxEl = document.createElement('input');
	const labelEl = document.createElement('label');
	const pseudoCheckboxEl = document.createElement('span');
	const bodyEl = document.createElement('p');
	const deleteEl = document.createElement('span');

	todoEl.classList.add('todo');
	
	// checkbox
	checkBoxEl.type = 'checkbox';
	checkBoxEl.checked = todo.completed;
	checkBoxEl.addEventListener('change', e => toggleCompleteTodo(todo.id));

	// body
	bodyEl.innerText = todo.body;
	todo.completed ? bodyEl.classList.add('done') : bodyEl.classList.remove('done');
	
	// delete
	deleteEl.innerHTML = '&times;'
	deleteEl.addEventListener('click', e => deleteTodo(todo.id));
	
	labelEl.appendChild(checkBoxEl);
	labelEl.appendChild(pseudoCheckboxEl);
	todoEl.appendChild(labelEl);
	todoEl.appendChild(bodyEl);
	todoEl.appendChild(deleteEl);
	return todoEl;
}

// function
function resetPageToFirst(){
	state.pagination.currentPage = 1;
	state.pagination.currentPageGroup = 1;
}

// function
function renderPagination(){
	paginationContainerEl.innerHTML = '';
	createPaginationChevron(paginationContainerEl, 'LEFT')
	createPaginationEndPage(paginationContainerEl, 'FIRST');
	createPaginationMidPages(paginationContainerEl);
	createPaginationEndPage(paginationContainerEl, 'LAST');
	createPaginationChevron(paginationContainerEl, 'RIGHT')
}

// function
function createPaginationMidPages(containerEl){
	const totalPages = calculateTotalPages();
	let startPage = null, endPage = null;
	if(state.todosToShow.length <= state.pagination.maxPages * state.pagination.todosPerPage){
		startPage = 1;
		endPage = totalPages + 1
	}else {
		const totalPagesArr = Array(totalPages).fill(1).map((el, i) => el + i);
		const skip = (state.pagination.currentPageGroup - 1) * state.pagination.maxPages;
		const pagesToShow = totalPagesArr.slice(skip, skip + state.pagination.maxPages);
		startPage = pagesToShow[0];
		endPage = pagesToShow[pagesToShow.length -1] + 1;
	}
	for(let i = startPage; i < endPage; i++){
		const paginationBtnEl = createPaginationBtn(i)
		containerEl.appendChild(paginationBtnEl);
	}
}

// function
function calculateTotalPages(){
	return Math.ceil(state.todosToShow.length / state.pagination.todosPerPage);
}

// function
function calculateTotalPageGroups(){
	return Math.ceil(calculateTotalPages() / state.pagination.maxPages);
}

// function
function togglePaginationDisable(paginationChevronEl, direction){
	const totalPageGroups = calculateTotalPageGroups();
	if(direction === 'RIGHT'){
		paginationChevronEl.disabled = state.pagination.currentPageGroup === totalPageGroups;
	}
	if(direction === 'LEFT'){
		paginationChevronEl.disabled = state.pagination.currentPageGroup === 1; 
	}
}

// function
function createPaginationChevron(containerEl, direction){
	const paginationChevronEl = document.createElement('button');
	 paginationChevronEl.innerHTML = direction === 'LEFT' ? '&ll;' : '&gg;';
	 togglePaginationDisable(paginationChevronEl, direction);
	 paginationChevronEl.addEventListener('click', e => showCurrentPageGroup(direction));
	 containerEl.appendChild(paginationChevronEl);
}

// function
function createPaginationBtn(page){
	const buttonEl = document.createElement('button');
	buttonEl.textContent = page;
	if (state.pagination.currentPage === page) buttonEl.classList.add('active');
	buttonEl.addEventListener('click', e => goToPage(buttonEl, page));
	return buttonEl;
}

// function
function createPaginationEndPage(containerEl, pageType){
	const totalPages = calculateTotalPages();
	if
		(
			(pageType === 'FIRST' && state.pagination.currentPageGroup !== 1) ||
			(pageType === 'LAST' && totalPages > state.pagination.maxPages && state.pagination.currentPageGroup !== calculateTotalPageGroups())
		) 
	{
		const buttonEl = document.createElement('button');
		const separatorEl = document.createElement('button');
		const spanEl = document.createElement('span');

		if(pageType === 'FIRST'){
			buttonEl.textContent = 1;
			spanEl.appendChild(buttonEl);
			spanEl.appendChild(separatorEl);
		}
		if(pageType === 'LAST'){
			buttonEl.textContent = totalPages;
			spanEl.appendChild(separatorEl);
			spanEl.appendChild(buttonEl);
		}
		separatorEl.innerHTML = '&hellip;'
		separatorEl.disabled = true;
		
		buttonEl.addEventListener('click', e => jumpToFirstOrLastPage(pageType));
		containerEl.appendChild(spanEl);
	}
}

// function
function showMessageOrTodos(){
	if(state.todos.length){
		mainEl.style.display = 'flex';
		todoActionsEl.style.display = 'flex';
		searchTodoBoxEl.style.display = 'flex';
		addTodosMessageEl.style.display = 'none';
	}else{
		mainEl.style.display = 'none';
		todoActionsEl.style.display = 'none';
		searchTodoBoxEl.style.display = 'none';
		addTodosMessageEl.style.display = 'flex';
	}
}

// Listeners

// listener
function createNewTodo(e) {
	const newTodoStr = newTodoInput.value.trim();
	if(!newTodoStr) return;
	const newTodo = new Todo(newTodoStr);
	state.todos.unshift(newTodo);
	state.todosToShow.unshift(newTodo);
	newTodoInput.value = '';
	renderTodos(state.todosToShow)
	renderPagination();
}

// listener
function searchTodos(e){
	if (!state.todos.length || !searchTodoInput.value.trim()) return;
	state.activeViewMode = 'ALL';
	searchTerm = searchTodoInput.value.trim().toLowerCase();
	const searchedTodos = state.todos.filter(todo => todo.body.toLowerCase().includes(searchTerm));
	state.todosToShow = searchedTodos;
	resetPageToFirst();
	renderTodos(state.todosToShow);
	togglePaginationDisplay(state.todosToShow);
}

// listener
function toggleCheckAllTodos(e){
	if(!state.todos.length) return;
	state.checkAllTodos = !state.checkAllTodos;
	toggleCheckAllBtn.textContent = state.checkAllTodos ? 'Uncheck All' : 'Check All';
	state.todos.forEach(todo => todo.completed = state.checkAllTodos);
	if(state.checkAllTodos && state.activeViewMode === 'ACTIVE'){
		return showActiveTodos();
	}
	if(!state.checkAllTodos && state.activeViewMode === 'COMPLETED'){
		return showCompletedTodos();
	}
	renderTodos(state.todosToShow);
}

// listener
function deleteAllTodos(e){
	if(state.todos.length && confirm('Are you sure you want to delete all Todos?')){
		state.todos = [];
		state.todosToShow = [];
		renderTodos (state.todosToShow);
	}
}

// listener
function showActiveTodos(e) {
	const activeTodos = state.todos.filter(todo => !todo.completed);
	state.todosToShow = activeTodos
	state.activeViewMode = 'ACTIVE';
	resetPageToFirst();
	renderTodos(state.todosToShow);
	return activeTodos;
}

// listener
function showCompletedTodos(e){
	const completedTodos = state.todos.filter(todo => todo.completed);
	state.todosToShow = completedTodos
	state.activeViewMode = 'COMPLETED';
	resetPageToFirst();
	renderTodos(state.todosToShow);
	return completedTodos;
}

// listener
function showAllTodos(e){
	state.todosToShow = state.todos.slice();
	state.activeViewMode = 'ALL';
	resetPageToFirst();
	renderTodos(state.todosToShow);
}

// listener
function deleteTodo(id){
	const showTodosIdx = state.todosToShow.findIndex(todo => todo.id === id);
	const allTodosIdx = state.todos.findIndex(todo => todo.id === id);
	state.todosToShow.splice(showTodosIdx, 1);
	state.todos.splice(allTodosIdx, 1);
	renderTodos(state.todosToShow);
}

// listener
function toggleCompleteTodo(id){
	const todoIdx = state.todosToShow.findIndex(todo => todo.id === id);
	state.todosToShow[todoIdx].completed = !state.todosToShow[todoIdx].completed;
	renderTodos(state.todosToShow);
	renderPagination();
}

// listener 
function showCurrentPageGroup(direction){
	const totalPageGroups = calculateTotalPageGroups();
	if(direction === 'RIGHT'){
		state.pagination.currentPageGroup += 1;
		if(state.pagination.currentPageGroup > totalPageGroups) state.pagination.currentPageGroup = totalPageGroups;
	}
	if(direction === 'LEFT'){
		state.pagination.currentPageGroup -= 1;
		if(state.pagination.currentPageGroup < 1) state.pagination.currentPageGroup = 1;	
	}
	renderTodos(state.todosToShow);
}

// listener
function goToPage(buttonEl, page){
	state.pagination.currentPage = page;
	const lastActivePage = document.querySelector('.pagination-container .active');
	if(lastActivePage) lastActivePage.classList.remove('active');	
	buttonEl.classList.add('active');
	renderTodos(state.todosToShow);
};

// listener
function jumpToFirstOrLastPage(pageType){
	if(pageType === 'FIRST'){
			state.pagination.currentPage = 1;
			state.pagination.currentPageGroup = 1;
		}
	if(pageType === 'LAST'){
		state.pagination.currentPage = calculateTotalPages();
		state.pagination.currentPageGroup = calculateTotalPageGroups();
	}
	renderTodos(state.todosToShow);
}


renderTodos(state.todosToShow);

