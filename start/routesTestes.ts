import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import type { HttpContext } from '@adonisjs/core/http'
// import auth from '#config/auth'
import User from '#models/user'

// Quando for acessada esta rota ('/'), vai ser criado
// este usuário administrador no banco de dados
router.get('/', () => {
  // User.create({ name: 'admin', email: 'admin@admin.com', password: '12345678', tipo: 'admin' })
  return { hortifruti: 'Prático' }
})

// Rota para obter o token
router.post('/gettoken', async ({ request, response }: HttpContext) => {
  const email = request.input('email')
  const password = request.input('password')
  // Busca o usuário pelo email
  // Verifica se a senha informada bate com o hash salvo no banco
  // Se estiver tudo certo, ele retorna uma instância real do model User.
  const user = await User.verifyCredentials(email, password)
  // E depois, gera o token para aquele usuário.
  const token = await User.accessTokens.create(user)
  return response.ok({
    type: 'bearer',
    token: token.value!.release(),
  })
})

// Rota para testar autenticação, via token
// auth: É o serviço de autenticação disponível no HttpContext
// do AdonisJS. Ele representa o estado de autenticação da
// requisição atual.
router
  .get('/auth', async ({ auth, response }: HttpContext) => {
    // Criando uma constante chamada userAuth, que
    // vai armazenar o usuário autenticado.
    const userAuth = auth.getUserOrFail()
    return response.ok({
      message: 'Usuário autenticado com sucesso',
      userAuth,
    })
  })
  .use(middleware.auth())

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
