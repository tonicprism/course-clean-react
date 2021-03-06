import faker from '@faker-js/faker'

import { mockAuthentication } from '@/domain/test/mock-authentication'
import { InvalidCredentialsError } from '@/domain/errors/invalid-credentials-error'
import { HttpPostClientSpy } from '@/data/test/mock-http-client'
import { HttpStatusCode } from '@/data/protocols/http/http-response'
import { UnexpectedError } from '@/domain/errors/unexpected-error'

import { RemoteAuthentication } from './remote-authentication'

type SutTypes = {
  sut: RemoteAuthentication
  httpPostClientSpy: HttpPostClientSpy
}

const makeSut = (url: string = faker.internet.url()): SutTypes => {
  const httpPostClientSpy = new HttpPostClientSpy()
  const sut = new RemoteAuthentication(url, httpPostClientSpy)

  return {
    sut,
    httpPostClientSpy
  }
}

describe('RemoteAuthentication', () => {
  test('Should call HttpPostClient with correct URL', async () => {
    const url = faker.internet.url()
    const { httpPostClientSpy, sut } = makeSut(url)

    await sut.auth(mockAuthentication())

    expect(httpPostClientSpy.url).toBe(url)
  })

  test('Should call HttpPostClient with correct body', async () => {
    const { httpPostClientSpy, sut } = makeSut()
    const authenticationParams = mockAuthentication()

    await sut.auth(authenticationParams)

    expect(httpPostClientSpy.body).toEqual(authenticationParams)
  })

  test('Should throw InvalidCredentials if HttpPostClient returns 401', async () => {
    const { httpPostClientSpy, sut } = makeSut()
    httpPostClientSpy.response = {
      statusCode: HttpStatusCode.UNAUTHORIZED
    }
    const authenticationParams = mockAuthentication()

    const promise = sut.auth(authenticationParams)

    await expect(promise).rejects.toThrow(new InvalidCredentialsError())
  })

  test('Should throw UnexpectedError if HttpPostClient returns 400', async () => {
    const { httpPostClientSpy, sut } = makeSut()
    httpPostClientSpy.response = {
      statusCode: HttpStatusCode.BAD_REQUEST
    }
    const authenticationParams = mockAuthentication()

    const promise = sut.auth(authenticationParams)

    await expect(promise).rejects.toThrow(new UnexpectedError())
  })

  test('Should throw UnexpectedError if HttpPostClient returns 404', async () => {
    const { httpPostClientSpy, sut } = makeSut()
    httpPostClientSpy.response = {
      statusCode: HttpStatusCode.NOT_FOUND
    }
    const authenticationParams = mockAuthentication()

    const promise = sut.auth(authenticationParams)

    await expect(promise).rejects.toThrow(new UnexpectedError())
  })

  test('Should throw UnexpectedError if HttpPostClient returns 500', async () => {
    const { httpPostClientSpy, sut } = makeSut()
    httpPostClientSpy.response = {
      statusCode: HttpStatusCode.SERVER_ERROR
    }
    const authenticationParams = mockAuthentication()

    const promise = sut.auth(authenticationParams)

    await expect(promise).rejects.toThrow(new UnexpectedError())
  })
})
