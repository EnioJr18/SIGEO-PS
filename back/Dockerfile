# Usa uma versão leve do Python 3.13 (a mesma do seu Railway)
FROM python:3.13-slim

# Instala as ferramentas do Linux e o GDAL (o chefão final)
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    binutils \
    libproj-dev \
    libgeos-dev \
    && rm -rf /var/lib/apt/lists/*

# Configura o GDAL para o Django achar
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

# Cria a pasta do projeto dentro do servidor
WORKDIR /app

# Copia os requisitos e instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o resto do seu código
COPY . .

# Expõe a porta que o Render gosta de usar
EXPOSE 10000

# O comando de ligar (usando a variável $PORT do Render)
CMD gunicorn sigeo_core.wsgi:application --bind 0.0.0.0:$PORT