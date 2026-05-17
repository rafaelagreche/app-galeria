import * as SQLite from 'expo-sqlite';

let db;

// Função para inicializar o banco de dados e criar a tabela obrigatória
export const initDatabase = async () => {
  try {
    // Abre ou cria o arquivo de banco de dados local
    db = await SQLite.openDatabaseAsync('gallery.db');
    
    // Executa a criação da tabela obrigatoria 'photos' conforme o modelo do enunciado
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        image_uri TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        created_at TEXT NOT NULL
      );
    `);
    console.log("Banco de dados e tabela 'photos' inicializados com sucesso.");
  } catch (error) {
    console.error("Erro crítico ao inicializar o banco de dados:", error);
    throw error; 
  }
};

// Salvar no SQLite: titulo, URI da imagem, latitude, longitude, data (Requisito Obrigatório)
export const insertPhoto = async (title, imageUri, latitude, longitude) => {
  try {
    const createdAt = new Date().toISOString(); // Gera a data atual em formato Texto
    
    // Usando runAsync com parâmetros (?) para garantir SQL parametrizado
    const result = await db.runAsync(
      `INSERT INTO photos (title, image_uri, latitude, longitude, created_at) VALUES (?, ?, ?, ?, ?);`,
      [title, imageUri, latitude, longitude, createdAt]
    );
    
    return result.lastInsertRowId; // Retorna o ID do item que acabou de ser salvo
  } catch (error) {
    console.error("Erro ao inserir foto no banco:", error);
    throw error;
  }
};

// Listar todas as imagens em uma tela de galeria (Requisito Obrigatório)
export const fetchAllPhotos = async () => {
  try {
    // Busca todos os registros ordenando do mais novo para o mais antigo
    const allRows = await db.getAllAsync(`SELECT * FROM photos ORDER BY id DESC;`);
    return allRows;
  } catch (error) {
    console.error("Erro ao buscar fotos no banco:", error);
    throw error;
  }
};

// Permitir excluir um item da galeria (Requisito Obrigatório)
export const deletePhoto = async (id) => {
  try {
    await db.runAsync(`DELETE FROM photos WHERE id = ?;`, [id]);
    return true;
  } catch (error) {
    console.error("Erro ao deletar foto do banco:", error);
    throw error;
  }
};