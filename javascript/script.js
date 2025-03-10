document.addEventListener("DOMContentLoaded", function () {
    console.log("Script carregado!");

    class No {
        constructor(tarefa) {
            this.tarefa = tarefa;
            this.proximo = null;
            this.anterior = null;
        }
    }

    class ListaDuplamenteEncadeada {
        constructor() {
            this.cabeca = null;
            this.cauda = null;
            this.atual = null;
            this.carregarDoArmazenamento();
        }

        inserir(tarefa) {
            const novoNo = new No(tarefa);
            if (!this.cabeca) {
                this.cabeca = novoNo;
                this.cauda = novoNo;
                this.atual = novoNo;
            } else {
                novoNo.anterior = this.cauda;
                this.cauda.proximo = novoNo;
                this.cauda = novoNo;
            }
            this.salvarNoArmazenamento();
            this.atualizarListaRemocao(); 
        }

        remover(tituloTarefa) {
            let atual = this.cabeca;
            while (atual !== null) {
                if (atual.tarefa.titulo === tituloTarefa) {
                    if (atual === this.cabeca) this.cabeca = atual.proximo;
                    if (atual === this.cauda) this.cauda = atual.anterior;
                    if (atual.anterior) atual.anterior.proximo = atual.proximo;
                    if (atual.proximo) atual.proximo.anterior = atual.anterior;
                    if (this.atual === atual) this.atual = atual.proximo || atual.anterior;
                    this.salvarNoArmazenamento();
                    this.atualizarListaRemocao(); 
                    return true;
                }
                atual = atual.proximo;
            }
            return false;
        }

        removerTodos() {
            this.cabeca = null;
            this.cauda = null;
            this.atual = null;
            this.salvarNoArmazenamento();
            this.atualizarListaRemocao();
        }

        buscar(termo) {
            let atual = this.cabeca;
            const resultados = [];
            while (atual !== null) {
                if (
                    atual.tarefa.titulo.toLowerCase().includes(termo) ||
                    atual.tarefa.descricao.toLowerCase().includes(termo) ||
                    atual.tarefa.status.toLowerCase().includes(termo) ||
                    atual.tarefa.prioridade.toLowerCase().includes(termo)
                ) {
                    resultados.push(atual.tarefa);
                }
                atual = atual.proximo;
            }
            return resultados;
        }

        editar(titulo, novosDados) {
            let atual = this.cabeca;
            while (atual !== null) {
                if (atual.tarefa.titulo === titulo) {
                    atual.tarefa = { ...atual.tarefa, ...novosDados };
                    this.salvarNoArmazenamento();
                    return true;
                }
                atual = atual.proximo;
            }
            return false;
        }

        exibir() {
            let atual = this.cabeca;
            const tarefas = [];
            while (atual !== null) {
                tarefas.push(atual.tarefa);
                atual = atual.proximo;
            }
            return tarefas;
        }

        salvarNoArmazenamento() {
            localStorage.setItem('listaDeTarefas', JSON.stringify(this.exibir()));
        }

        carregarDoArmazenamento() {
            const tarefas = JSON.parse(localStorage.getItem('listaDeTarefas')) || [];
            this.cabeca = null;
            this.cauda = null;
            this.atual = null;
            tarefas.forEach(tarefa => this.inserir(tarefa));
        }
        

        navegarParaTarefaAnterior() {
            if (this.atual && this.atual.anterior) {
                this.atual = this.atual.anterior;
                return this.atual.tarefa;
            }
            return null;
        }

        navegarParaProximaTarefa() {
            if (this.atual && this.atual.proximo) {
                this.atual = this.atual.proximo;
                return this.atual.tarefa;
            }
            return null;
        }

        atualizarListaRemocao() {
            const tarefas = this.exibir();
            const dropdown = document.getElementById('remove-task-dropdown');
            if (dropdown) {
                dropdown.innerHTML = tarefas.map(tarefa => `<div>${tarefa.titulo}</div>`).join('');
            }
        }
    }

    const listaDeTarefas = new ListaDuplamenteEncadeada();

   
    document.getElementById('add-task-form')?.addEventListener('submit', function (e) {
        e.preventDefault();

        const titulo = document.getElementById('task-title').value.trim();
        const descricao = document.getElementById('task-description').value.trim();
        const responsavel = document.getElementById('task-responsible').value.trim();
        const prioridade = document.getElementById('task-priority').value;
        const dataConclusao = document.getElementById('task-due-date').value;
        const status = document.getElementById('task-status').value;

        if (titulo === '' || descricao === '' || responsavel === '') {
            return;
        }

        const novaTarefa = { titulo, descricao, responsavel, prioridade, dataConclusao, status };
        listaDeTarefas.inserir(novaTarefa);
        alert('Tarefa adicionada com sucesso!');

        document.getElementById('add-task-form').reset();
        atualizarListaDeTarefas(listaDeTarefas.exibir());
    });

  
    document.getElementById('remove-task-form')?.addEventListener('submit', function (e) {
        e.preventDefault();

        const titulo = document.getElementById('remove-title').value.trim();
        if (titulo === '') {
            return;
        }

        const removida = listaDeTarefas.remover(titulo);
        if (removida) {
            alert('Tarefa removida com sucesso!');
        } else {
            alert('Erro: Tarefa não encontrada.');
        }

        document.getElementById('remove-task-form').reset();
        atualizarListaDeTarefas(listaDeTarefas.exibir());
    });

   
document.getElementById('prev-task')?.addEventListener('click', function () {
    const tarefa = listaDeTarefas.navegarParaTarefaAnterior();
    if (tarefa) {
        exibirTarefaAtual(tarefa); 
        document.getElementById('task-navigation-message').textContent = '';
    } else {
        document.getElementById('task-navigation-message').textContent = 'Não há tarefas anteriores.';
    }
});


document.getElementById('next-task')?.addEventListener('click', function () {
    const tarefa = listaDeTarefas.navegarParaProximaTarefa();
    if (tarefa) {
        exibirTarefaAtual(tarefa); 
        document.getElementById('task-navigation-message').textContent = ''; 
    } else {
        document.getElementById('task-navigation-message').textContent = 'Não há tarefas seguintes.';
    }
});


function exibirTarefaAtual(tarefa) {
    const tarefaAtualContainer = document.getElementById('tarefa-atual');
    if (tarefaAtualContainer) {
        tarefaAtualContainer.innerHTML = `
            <h3>Tarefa Atual</h3>
            <p><strong>Título:</strong> ${tarefa.titulo}</p>
            <p><strong>Descrição:</strong> ${tarefa.descricao}</p>
            <p><strong>Status:</strong> ${tarefa.status}</p>
            <p><strong>Prioridade:</strong> ${tarefa.prioridade}</p>
            <p><strong>Data de Conclusão:</strong> ${tarefa.dataConclusao}</p>
        `;
    } else {
        console.error('Elemento com ID "tarefa-atual" não encontrado no DOM.');
    }
}

    function atualizarListaDeTarefas(tarefas) {
        const taskList = document.getElementById('task-list');
        if (taskList) {
            let listaDeTarefasHTML = '<ul>';
            tarefas.forEach(tarefa => {
                listaDeTarefasHTML += `<li class="task-item" data-titulo="${tarefa.titulo}">
                    <h3>${tarefa.titulo}</h3>
                    <p><strong>Descrição:</strong> ${tarefa.descricao}</p>
                    <p><strong>Status:</strong> ${tarefa.status}</p>
                    <p><strong>Prioridade:</strong> ${tarefa.prioridade}</p>
                    <p><strong>Data de Conclusão:</strong> ${tarefa.dataConclusao}</p>
                </li>`;
            });
            listaDeTarefasHTML += '</ul>';
            taskList.innerHTML = listaDeTarefasHTML;

         
            document.querySelectorAll('.task-item').forEach(item => {
                
                item.addEventListener('mouseenter', function () {
                    item.style.backgroundColor = '#555'; 
                    item.style.color = '#fff'; 
                });

            
                item.addEventListener('mouseleave', function () {
                    item.style.backgroundColor = ''; 
                    item.style.color = '';
                });

              
                item.addEventListener('click', function () {
                    const titulo = item.getAttribute('data-titulo');
                    const tarefa = listaDeTarefas.exibir().find(t => t.titulo === titulo);
                    preencherCamposEdicao(tarefa);
                });
            });
        }
    }

   
    function preencherCamposEdicao(tarefa) {
        document.getElementById('edit-title').value = tarefa.titulo;
        document.getElementById('edit-description').value = tarefa.descricao;
        document.getElementById('edit-priority').value = tarefa.prioridade;
        document.getElementById('edit-status').value = tarefa.status;
        document.getElementById('edit-date').value = tarefa.dataConclusao;
    }

    document.getElementById('delete-all-tasks')?.addEventListener('click', function () {
        if (listaDeTarefas.exibir().length === 0) {
            alert('Não há tarefas para apagar.');
        } else {
            const confirmDelete = confirm("Você tem certeza que deseja apagar todas as tarefas?");
            if (confirmDelete) {
                listaDeTarefas.removerTodos();
                atualizarListaDeTarefas([]);
                alert('Todas as tarefas foram apagadas!');
            }
        }
    });

    
    document.getElementById('search-task')?.addEventListener('input', function (e) {
        const termo = e.target.value.trim().toLowerCase(); 
        const tarefas = listaDeTarefas.exibir(); 

       
        const resultados = tarefas.filter(tarefa => {
           
            const titulo = tarefa.titulo ? tarefa.titulo.toLowerCase() : '';
            const descricao = tarefa.descricao ? tarefa.descricao.toLowerCase() : '';
            const status = tarefa.status ? tarefa.status.toLowerCase() : '';
            const prioridade = tarefa.prioridade ? tarefa.prioridade.toLowerCase() : '';

            
            return (
                titulo.includes(termo) || 
                descricao.includes(termo) || 
                status.includes(termo) || 
                prioridade.includes(termo) 
            );
        });

      
        atualizarListaDeTarefas(resultados);
    });


    document.getElementById('edit-task-form')?.addEventListener('submit', function (e) {
        e.preventDefault();

        const titulo = document.getElementById('edit-title').value.trim();
        const novosDados = {
            descricao: document.getElementById('edit-description').value.trim(),
            status: document.getElementById('edit-status').value,
            prioridade: document.getElementById('edit-priority').value,
            dataConclusao: document.getElementById('edit-date').value
        };

        if (titulo === '' || novosDados.descricao === '') {
            alert('Erro: Preencha todos os campos obrigatórios antes de editar a tarefa.');
            return;
        }

        const editada = listaDeTarefas.editar(titulo, novosDados);
        if (editada) {
            alert('Tarefa editada com sucesso!');
        } else {
            alert('Erro: Tarefa não encontrada.');
        }

        document.getElementById('edit-task-form').reset();
        atualizarListaDeTarefas(listaDeTarefas.exibir());
    });

   
    document.getElementById('sort-tasks')?.addEventListener('change', function () {
        const criterio = this.value;
        const tarefas = listaDeTarefas.exibir();
        if (criterio === 'dataConclusao') {
            tarefas.sort((a, b) => new Date(a.dataConclusao) - new Date(b.dataConclusao));
        } else if (criterio === 'status') {
            tarefas.sort((a, b) => a.status.localeCompare(b.status));
        } else if (criterio === 'prioridade') {
            const prioridades = { 'Alta': 1, 'Média': 2, 'Baixa': 3 };
            tarefas.sort((a, b) => prioridades[a.prioridade] - prioridades[b.prioridade]);
        }
        atualizarListaDeTarefas(tarefas);
    });

    
    document.getElementById('export-json')?.addEventListener('click', function () {
        const tarefas = JSON.stringify(listaDeTarefas.exibir(), null, 2);
        const blob = new Blob([tarefas], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'tarefas.json';
        a.click();
    });

   
    document.getElementById('import-json')?.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const tarefas = JSON.parse(event.target.result);
                tarefas.forEach(tarefa => listaDeTarefas.inserir(tarefa));
                atualizarListaDeTarefas(listaDeTarefas.exibir());
            };
            reader.readAsText(file);
        }
    });

   
    atualizarListaDeTarefas(listaDeTarefas.exibir());

    
   const removeTitleInput = document.getElementById('remove-title');
   const taskSuggestions = document.getElementById('task-suggestions');

   if (removeTitleInput && taskSuggestions) {

       removeTitleInput.addEventListener('focus', function () {
           taskSuggestions.style.display = 'block';
           atualizarListaRemocao();
       });

     
       removeTitleInput.addEventListener('blur', function () {
        
           setTimeout(() => {
               taskSuggestions.style.display = 'none';
           }, 200);
       });

    
       taskSuggestions.addEventListener('click', function (e) {
           if (e.target.tagName === 'DIV') {
             
               removeTitleInput.value = e.target.textContent;
               taskSuggestions.style.display = 'none'; 
           }
       });

      
       function atualizarListaRemocao() {
           const tarefas = listaDeTarefas.exibir();
           if (tarefas.length > 0) {
               taskSuggestions.innerHTML = tarefas.map(tarefa => `
                   <div>${tarefa.titulo}</div>
               `).join('');
           } else {
               taskSuggestions.innerHTML = '<div>Nenhuma tarefa encontrada.</div>';
           }
       }
   } else {
       console.error('Elementos "remove-title" ou "task-suggestions" não encontrados no DOM.');
   }

 

function salvarBackup() {
    const tarefas = listaDeTarefas.exibir();
    const timestamp = new Date().toISOString(); 
    const backup = { timestamp, tarefas };

    
    const backups = JSON.parse(localStorage.getItem('backups') || '[]');


    if (backups.length >= 3) {
        const confirmacao = confirm("Você já tem 3 backups. Um novo backup substituirá o mais antigo. Deseja continuar?");
        if (!confirmacao) {
            return; 
        }
    }


    backups.push(backup);

   
    if (backups.length > 3) {
        backups.shift(); 
    }

  
    localStorage.setItem('backups', JSON.stringify(backups));
    alert('Backup realizado com sucesso!');
}


function carregarBackups() {
    const backups = JSON.parse(localStorage.getItem('backups')) || [];
    const backupList = document.getElementById('backup-list');
    if (backupList) {
        backupList.innerHTML = backups.map((backup, index) => {
           
            const dataHora = new Date(backup.timestamp).toLocaleString();
            return `
                <div>
                    <p>Backup ${index + 1} - ${dataHora}</p>
                    <button class="restaurar-btn" data-index="${index}">Restaurar</button>
                    <button class="apagar-btn" data-index="${index}">Apagar</button>
                </div>
            `;
        }).join('');
    }

   
    document.querySelectorAll('.restaurar-btn').forEach(button => {
        button.addEventListener('click', function () {
            const index = this.getAttribute('data-index');
            restaurarBackup(index);
        });
    });

    document.querySelectorAll('.apagar-btn').forEach(button => {
        button.addEventListener('click', function () {
            const index = this.getAttribute('data-index');
            apagarBackup(index);
        });
    });
}


function restaurarBackup(index) {
    const backups = JSON.parse(localStorage.getItem('backups')) || [];
    const backup = backups[index];

    if (backup) {
        const confirmRestore = confirm("Isso adicionará as tarefas do backup à lista atual. Deseja continuar?");
        if (confirmRestore) {
           
            backup.tarefas.forEach(tarefa => listaDeTarefas.inserir(tarefa));

            alert('Tarefas do backup adicionadas com sucesso!');
            atualizarListaDeTarefas(listaDeTarefas.exibir());
        }
    } else {
        alert('Backup não encontrado.');
    }
}


function apagarBackup(index) {
    const backups = JSON.parse(localStorage.getItem('backups')) || [];
    const confirmDelete = confirm("Tem certeza que deseja apagar este backup?");
    if (confirmDelete) {
      
        backups.splice(index, 1);

       
        localStorage.setItem('backups', JSON.stringify(backups));

    
        carregarBackups();
        alert('Backup apagado com sucesso!');
    }
}


document.getElementById('backup-tasks')?.addEventListener('click', salvarBackup);


document.getElementById('restore-tasks')?.addEventListener('click', function () {
    carregarBackups(); 
});


carregarBackups();
   
  
    listaDeTarefas.atualizarListaRemocao();
});