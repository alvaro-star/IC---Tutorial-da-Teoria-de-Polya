import time

lambFiltrado = []
alfaFiltrado = []

lambRegra = []
alfaRegra = []

def print_partition(p, m, r, lamb, alfa):
    """
    Função auxiliar para imprimir a partição no formato p1^m1 p2^m2 ...
    Onde p é a parte e m é sua multiplicidade.

    Argumentos:
        p (list): Lista de partes distintas da partição (ex: [6, 3, 2, 1])
        m (list): Lista de multiplicidades correspondentes (ex: [2, 1, 4, 1])
        r (int): O número de entradas válidas nas listas p e m.
    """
    tempAlfa = []
    tempLamb = []

    for i in range(r):
        tempLamb.append(m[i])
        tempAlfa.append(p[i])

    
    alfa.append(tempAlfa)
    lamb.append(tempLamb)

def generate_integer_partitions_k_parts(n, k):
    
    """
    Implementação do Algoritmo 7 para gerar todas as partições inteiras de n.
    O algoritmo usa uma representação de multiplicidade:
    - p: armazena as partes distintas da partição em ordem decrescente.
    - m: armazena a contagem (multiplicidade) de cada parte correspondente em p.
    - r: indica o número de partes distintas atuais.

    A lógica de transição para a próxima partição é:
    1. Encontrar a menor parte p[pivo] que seja maior que 1.
    2. Pegar uma instância dessa parte p[pivo] e todas as partes de tamanho 1. Calcular a soma total 's'.
    3. Criar uma nova parte de tamanho p[pivo]-1. A multiplicidade dessa nova parte é s // (p[pivo]-1).
    4. O resto s % (p[k]-1) forma uma parte final adicional, se não for zero.
    """
    
    p = [0] * (k+1)
    m = [0] * (k+1)
    
    p[0] = n
    m[0] = 1
    r = 1

    numParts = 1

    
    while True:
        """
        pivo    = posição da menor parte maior que 1
        s     = soma do valor do pivo com tudo que for menor que ele
        w       = Valor do maior numero menor que o valor do pivo
        u       = multiplicidade de w pela soma
        v       = resto da divisão entre so+ma e 'w'
        """
        print_partition(p,m,r, lambRegra, alfaRegra)
            
        if p[r-1] == 1: #Se o contem 1
            pivo = r-2
        else: #Se não conter 1
            pivo = r-1
    
        s = 0
            
        if (p[r-2] == 2 or p[r-1] != 1) and numParts+1 > k: #Realiza o 'pulo'
            pivo -= 1 #Joga o pivo para o próximo menor numero
            if p[pivo] == p[pivo+1]+1 and p[r-1] > 1:
                pivo -= 1 #Joga o pivo para o próximo menor numero

        if pivo < 0:
            break
            
        w = p[pivo] -1

        #Soma o pivo com todos os numeros menores que ele
        s += p[pivo]*1
        for i in range(pivo+1,r,1):
            s += p[i]*m[i]
            numParts -= m[i]

        u = s // w #Calcula o quanto de 'w' cabe em 's' 
        v = s % w  #Calcula o resto de 'w' por 's'

        m[pivo] -= 1 #Subtrai uma unidade do pivo
        numParts -= 1
        
        #Guarda a posição de onde sera escrito as novas partes
        if m[pivo] == 0:
            pivo1 = pivo 
        else:
            pivo1 = pivo + 1

        p[pivo1] = w
        m[pivo1] = u
        numParts += u
        
        if v == 0:
            r = pivo1 + 1
        else:
            p[pivo1+1] = v
            m[pivo1+1] = 1
            numParts += 1
            r = pivo1 +2
            
def generate_integer_partitions(n, k):
    
    """
    Implementação do Algoritmo 7 para gerar todas as partições inteiras de n.
    O algoritmo usa uma representação de multiplicidade:
    - p: armazena as partes distintas da partição em ordem decrescente.
    - m: armazena a contagem (multiplicidade) de cada parte correspondente em p.
    - r: indica o número de partes distintas atuais.

    A lógica de transição para a próxima partição é:
    1. Encontrar a menor parte p[k] que seja maior que 1.
    2. Pegar uma instância dessa parte p[k] e todas as partes de tamanho 1. Calcular a soma total 's'.
    3. Criar uma nova parte de tamanho p[k]-1. A multiplicidade dessa nova parte é s // (p[k]-1).
    4. O resto s % (p[k]-1) forma uma parte final adicional, se não for zero.
    """
    
    p = [0] * (n+1)
    m = [0] * (n+1)
    
    p[0] = n
    m[0] = 1
    r = 1
    
    done = False
    #print(f'--- Partições de n = {n} com Filtro ---')
    
    while not done:
        """
        pivo    = posição da menor parte maior que 1
        s     = soma do valor do pivo com tudo que for menor que ele
        w       = Valor do maior numero menor que o valor do pivo
        u       = multiplicidade de w pela soma
        v       = resto da divisão entre so+ma e 'w'
        """
        sumPart = 0
        for i in range(r):
            sumPart += m[i]

        if sumPart <= k:
            print_partition(p,m,r, lambFiltrado, alfaFiltrado)
        
        if (p[r-1] <= 1 and r <= 1) :  #Otimização: or m[0] == k
            done = True
        else:
            if p[r-1] == 1: #Se o contem 1
                pivo = r-2
                s = p[pivo] + m[r-1] #Soma o menor valor maior que 1 com todos os 1s
            else: #Se não conter 1
                pivo = r-1
                s = p[pivo] #Soma apenas o menor valor
        
            w = p[pivo] -1
            
            sumPart = 0
            for i in range(r):
                sumPart += m[i]

            else: 
                u = s // w 
                v = s % w 
                
                m[pivo] -= 1 #Subtrai uma unidade do pivo
                
                #Guarda a posição de onde sera escrito as novas partes
                if m[pivo] == 0:
                    pivo1 = pivo 
                else:
                    pivo1 = pivo + 1
                    
                p[pivo1] = w
                m[pivo1] = u
                
                if v == 0:
                    r = pivo1 + 1
                else:
                    p[pivo1+1] = v
                    m[pivo1+1] = 1
                    
                    r = pivo1 +2

try:

    n = int(input("Digite um número inteiro para calcular suas partições: "))
    k = int(input("Digite o número máximo de partes: "))

    if n <= 0 or k <= 0:
        print("Por favor, insira um números inteiros positivos.")
    else:
        tempoFiltro = 0
        tempoFiltro -= time.time()
        generate_integer_partitions(n, k)
        tempoFiltro += time.time()
        tempoRegra = 0
        tempoRegra -= time.time()
        generate_integer_partitions_k_parts(n, k)
        tempoRegra += time.time()
        print(f'Com filtro: {len(lambFiltrado)}, com regra: {len(lambRegra)}')
        #if len(lambRegra) == len(lambFiltrado):
        
        #Compara as matrizes gerado pelo algoritimo com o filtro e com regra
        found = False
        for i in range(len(lambFiltrado)):
            for j in range(len(lambFiltrado[i])):
                if lambFiltrado[i][j] != lambRegra[i][j] or alfaFiltrado[i][j] != alfaRegra[i][j]:
                    print('Regra: ',end='')
                    for b in range(len(alfaRegra[i])):
                        print(f'{alfaRegra[i][b]}^{lambRegra[i][b]}', end=' ')
                    print('')
                    print('Filtrado: ',end='')
                    for b in range(len(alfaFiltrado[i])):
                        print(f'{alfaFiltrado[i][b]}^{lambFiltrado[i][b]}', end=' ')
                    print('')
                    found = True
                    break
            if found:   
                break
        if not found and len(lambRegra) == len(lambFiltrado):
            print('Matriz identica! :)')
        print(f'Tempo Filtro: {tempoFiltro:.5f} segundos')
        print(f'Tempo Regra: {tempoRegra:.5f} segundos')

except ValueError:
    print("Entrada inválida.")